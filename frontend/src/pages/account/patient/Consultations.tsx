import AccountLayout from "../AccountLayout";
import reschedule from '../../../assets/images/reschedule.png';
import cancel from '../../../assets/images/cancel.png';

const Consultations: React.FC = () => {
    return (
        <AccountLayout>
            <div className="consultations">

                <h2 className="consultations__title">Предстоящие консультации</h2>
                <div className="consultations__consultations-now">
                    <div className="block">
                        <h2>Завтра, 15:30 - 16:30</h2>
                        <p><strong>Специалист: </strong> <a href="\">Анна Петрова</a></p>
                        <p><strong>Условия: </strong> Бесплатные отмена и перенос более чем за 12 часов</p>
                        <div className="icons">
                            <div className="icon-block">
                                <img src={reschedule} id="reschedule" />
                                <label htmlFor="reschedule ">Перенести</label>
                            </div>
                            <div className="icon-block">
                                <img src={cancel} id="cancel" />
                                <label htmlFor="cancel ">Отменить</label>
                            </div>
                        </div>
                    </div>
                </div>

                <br />
                <h2 className="consultations__title">Архив консультации</h2>
                <div className="consultations__consultations-archive">
                    <div className="block">
                        <h2>Вчера, 15:30 - 16:30</h2>
                        <p><strong>Специалист: </strong> <a href="\">Анна Петрова</a></p>
                        <div className="icons">
                            <div className="icon-block">
                                <img src={reschedule} id="reschedule" />
                                <label htmlFor="reschedule ">Оценить</label>
                            </div>
                            <div className="icon-block">
                                <img src={cancel} id="cancel" />
                                <label htmlFor="cancel">Повторить</label>
                            </div>
                        </div>
                    </div>

                    <div className="block">
                        <h2>Вчера, 10:00 - 11:00</h2>
                        <p><strong>Специалист: </strong> <a href="\">Мария Иванова</a></p>
                        <div className="icons">
                            <div className="icon-block">
                                <img src={reschedule} id="reschedule" />
                                <label htmlFor="reschedule ">Оценить</label>
                            </div>
                            <div className="icon-block">
                                <img src={cancel} id="cancel" />
                                <label htmlFor="cancel">Повторить</label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AccountLayout>
    )
}

export default Consultations;