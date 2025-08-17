import { useContext, useEffect, useState } from "react";
import { menuItemsAdmin, RouteNames } from "../../../routes";
import AccountLayout from "../AccountLayout";
import { Context } from "../../../main";
import { useNavigate } from "react-router";
import { URL } from "../../../http";

// Define the type for a batch item
interface Batch {
    id: number;
    status: 'pending' | 'approved' | 'rejected';
    rejection_reason: string | null;
    is_urgent: boolean;
    field_name: string;
    new_value: string;
    old_value: string;
    specialist?: {
        id: number;
        name: string;
    };
}

const Specialists = () => {
    const { store } = useContext(Context);
    const navigate = useNavigate();
    const [batches, setBatches] = useState<Batch[]>([]); // Add type annotation here

    const logout = () => {
        store.logout();
        navigate(RouteNames.MAIN);
    }

    const getBatchAll = async () => {
        const data = await store.getBatchAll(10, 1);
        if (data && data.batches) {
            setBatches(data.batches);
        }
    }

    // const handleStatusChange = async (batchId: number, newStatus: 'approved' | 'rejected') => {
    //     try {
    //         await store.updateBatchStatus(batchId, newStatus);
    //         getBatchAll(); // Refresh the list after update
    //     } catch (error) {
    //         console.error("Error updating batch status:", error);
    //     }
    // }

    const isFile = (value: string) => {
        if (!value) return false;
        const fileExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
        return fileExtensions.some(ext => value.toLowerCase().endsWith(ext));
    }

    const renderValue = (value: string) => {
        if (isFile(value)) {
            return (
                <a href={`${URL}/${value}`} target="_blank" rel="noopener noreferrer">
                    {value}
                </a>
            );
        }
        return value;
    }

    useEffect(() => {
        getBatchAll();
    }, []);

    return (
        <AccountLayout menuItems={menuItemsAdmin}>
            <button onClick={logout}>Выйти из аккаунта</button>
            <h3 className="tab">Редактирование профилей</h3>
            <div className="admin-page">
                <table className="admin-page__table">
                    <thead>
                        <tr>
                            <th>Специалист</th>
                            <th>Поле</th>
                            <th>Старое значение</th>
                            <th>Новое значение</th>
                            <th>Статус</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.length > 0 ? (
                            batches.map((batch) => (
                                <tr key={batch.id}>
                                    <td>
                                        {batch.specialist?.name || 'Неизвестный специалист'}
                                        <br />
                                        ID: {batch.specialist?.id || batch.id}
                                    </td>
                                    <td>{batch.field_name}</td>
                                    <td>{renderValue(batch.old_value)}</td>
                                    <td>{renderValue(batch.new_value)}</td>
                                    <td className="confirm">Подтвердить</td>
                                    <td className="reject">Отклонить</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6}>Нет данных для отображения</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AccountLayout>
    )
}

export default Specialists;