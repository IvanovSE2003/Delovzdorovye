import { observer } from "mobx-react-lite";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Context } from "../../../../main";
import type { User } from "../../../../models/Auth";
import AccountLayout from "../../AccountLayout";
import BasicTab from "./BasicTab";
import { normalizePhone } from "../../../../helpers/formatPhone";

type TabRole = "ALL" | "ADMIN" | "DOCTOR" | "PATIENT" | null;

const Users: React.FC = () => {
  const { store } = useContext(Context);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState<boolean>(false);

  const getInitialRole = () => {
    const roleFromUrl = searchParams.get("role");
    return (roleFromUrl as TabRole) || null;
  };

  const [selectedRole, setSelectedRole] = useState<TabRole>(getInitialRole());

  // Получение всех данных пользователей
  const getAllUsers = async () => {
    setLoading(true)
    const data = await store.getUsersAll();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    if ((selectedRole || searchTerm.trim() !== "") && users.length === 0) {
      getAllUsers();
    }
  }, [selectedRole, searchTerm]);

  // Обновляем URL при изменении роли
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (selectedRole) {
      newSearchParams.set("role", selectedRole);
    } else {
      newSearchParams.delete("role");
    }
    setSearchParams(newSearchParams);
  }, [selectedRole]);

  // Фильтрация
  useEffect(() => {
    let filtered = users;

    filtered = filtered.filter(user => user.id !== store.user.id);

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const termDigits = searchTerm.replace(/\D/g, "");

      filtered = filtered.filter(user => {
        const fio = `${user.name || ""} ${user.surname || ""} ${user.patronymic || ""}`.toLowerCase();
        const email = (user.email || "").toLowerCase();
        const phone = normalizePhone(user.phone);

        return (
          fio.includes(term) ||
          email.includes(term) ||
          (termDigits && phone.includes(termDigits))
        );
      });
    }

    switch (selectedRole) {
      case "ADMIN":
      case "DOCTOR":
      case "PATIENT":
        filtered = filtered.filter(user => user.role === selectedRole);
        break;
      case "ALL":
        break;
      case null:
        if (searchTerm.trim() === "") {
          filtered = [];
        }
        break;
    }

    setFilteredUsers(filtered);
  }, [searchTerm, users, selectedRole, store.user.id]);

  return (
    <AccountLayout>
      <div className="page-container admin-page">
        <h1 className="consultations-doctor__main-title">Учетные записи</h1>
        <BasicTab
          filteredUsers={filteredUsers}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedRole={selectedRole}
          loading={loading}
          onRoleChange={(role) => setSelectedRole(role as TabRole)}
        />
      </div>
    </AccountLayout>
  );
};

export default observer(Users);