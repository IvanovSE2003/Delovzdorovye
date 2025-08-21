import AccountLayout from "../AccountLayout";

const Recomendations = () => {
    return (
        <AccountLayout>
            <div className="recomendations">

                <h2 className="recomendations__title">Рекомендации от специалистов</h2>

                <div className="recomendations__blocks">
                    <div className="block">
                        <h3>Рекомендация от Анна Петрова, Нутрициолог</h3>
                        <div className="block__info">
                            <a href="/">Документ</a>
                            <div className="date">
                                05.08, 13:33
                            </div>
                        </div>
                    </div>

                    <div className="block">
                        <h3>Рекомендация от Анна Иванова, Психолог</h3>
                        <div className="block__info">
                            <a href="/">Документ</a>
                            <div className="date">
                                04.08, 20:00
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AccountLayout >
    )
}

export default Recomendations;