import { observer } from "mobx-react-lite";
import { useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Tabs from "../../../../components/UI/Tabs/Tabs";
import { Context } from "../../../../main";
import type { User } from "../../../../models/Auth";
import AccountLayout from "../../AccountLayout";
import BasicTab from "./BasicTab";

type TabType = "BASIC";
type TabRole = "ALL" | "ADMIN" | "DOCTOR" | "PATIENT";

const Users = () => {
  const { store } = useContext(Context);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchParams, setSearchParams] = useSearchParams();
  
  const getInitialRole = () => {
    const roleFromUrl = searchParams.get('role');
    return (roleFromUrl as TabRole) || "ALL";
  };

  const getInitialTab = () => {
    const tabFromUrl = searchParams.get('tab');
    return (tabFromUrl as TabType) || "BASIC";
  };

  const [selectedRole, setSelectedRole] = useState<TabRole>(getInitialRole());
  const [selectedTab, setSelectedTab] = useState<TabType>(getInitialTab());

  // Загрузка данных при открытии страницы
  useEffect(() => {
    getAllUsers();
  }, []);

  // Обновляем URL при изменении роли или таба
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('role', selectedRole);
    newSearchParams.set('tab', selectedTab);
    setSearchParams(newSearchParams);
  }, [selectedRole, selectedTab]);

  // Фильтрация
  useEffect(() => {
    let filtered = users;

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(user =>
        `${user.name || ''} ${user.surname || ''} ${user.patronymic || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== "ALL") {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, users, selectedRole]);

  // Получение все данных пользователей
  const getAllUsers = async () => {
    const data = await store.getUsersAll();
    setUsers(data);
    setFilteredUsers(data);
  };

  // Заблокировать или разблокировать пользователя
  const blockedOrUnblocked = async (id: number, isBlocked: boolean, role: string) => {
    if (role === "ADMIN") return;

    !isBlocked
      ? await store.blockUser(id)
      : await store.unblockUser(id);

    getAllUsers();
  };

  // Изменить роль пользователя
  const changeRoleUser = async (id: number, role: string) => {
    if (role === "ADMIN") return;

    if (role === "DOCTOR") {
      await store.changeRoleUser(id, "PATIENT");
    } else {
      await store.changeRoleUser(id, "DOCTOR");
    }
    
    getAllUsers();
  };

  return (
    <AccountLayout>
      <div className="page-container admin-page">
        <h1 className="admin-page__title">Профили</h1>

        <Tabs
          tabs={[
            { name: "BASIC", label: "Основные данные" },
          ]}
          activeTab={selectedTab}
          onTabChange={(tabName) => setSelectedTab(tabName as TabType)}
          paramName="mainTab" 
          syncWithUrl={true} 
        />

        {selectedTab === "BASIC" && (
          <BasicTab
            filteredUsers={filteredUsers}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedRole={selectedRole}
            onRoleChange={(role) => setSelectedRole(role as TabRole)}
            onBlockUser={blockedOrUnblocked}
            onChangeRole={changeRoleUser}
          />
        )}
      </div>
    </AccountLayout>
  );
};

export default observer(Users);