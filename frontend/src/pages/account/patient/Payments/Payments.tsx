import { useEffect, useState } from "react"
import LoaderUsefulInfo from "../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";
import { processError } from "../../../../helpers/processError";
import AccountLayout from "../../AccountLayout";
import './Payments.scss';
import ConsultationService from "../../../../services/ConsultationService";
import type { Consultation } from "../../../../models/consultations/Consultation";
import { Link } from "react-router";

const Payments: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [payments, setPayments] = useState<Consultation[]>([] as Consultation[]);


    const fetchCurrentOrder = async () => {
        try {
            setLoading(true);
            const response = await ConsultationService.getAllConsultations(4, 1, {
                payment_status: "PAYMENT"
            })
            setPayments(response.data.consultations)
        } catch (e) {
            processError(e, "Ошибка при загрузке не оплаченных консультаций");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCurrentOrder();
    }, [])

    if (loading) return (
        <AccountLayout>
            <div className="page-container">
                <h1 className="consultations-doctor__main-title">
                    Не оплаченные консультации
                </h1>
                <LoaderUsefulInfo />
            </div>
        </AccountLayout>
    )


    return (
        <AccountLayout>
            <div className="page-container">
                <h1 className="consultations-doctor__main-title">
                    Не оплаченные консультации
                </h1>

                <div className="payments">
                    {payments.length > 0 ? payments.map((payment) => (
                        <div className="payments-card">
                            <div className="payments-card__times">
                                Временной слот забронирован на 5:02
                            </div>
                            <div className="payments-card__field">
                                <span> Специалист: {' '}</span>
                                <Link to={`/profile/${payment.DoctorUserId}`}>
                                    {payment.DoctorSurname} {payment.DoctorName} {payment.DoctorPatronymic ?? ""}
                                </Link>
                            </div>
                            <div className="payments-card__field">
                                <span>Проблемы: {` `}</span>
                                {payment.Problems || "Другая проблема."}
                            </div>
                            <div className="payments-card__field">
                                <span>Подробно: {` `}</span>
                                {payment.descriptionProblem || "Не указано."}
                            </div>
                            <div className="payments-card__actions">
                                <button
                                    className="my-button"
                                >
                                    Оплатить
                                </button>
                                <button
                                    className="neg-button"
                                >
                                    Удалить
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="payments-none">
                            <div className="payments-none__icon">👍</div>
                            <span className="payments-none__text">
                                Неопраченных консультаций нет
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </AccountLayout >
    )
}

export default Payments