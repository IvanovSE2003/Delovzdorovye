import AccountLayout from "./AccountLayout"

const Bell = () => {
    return (
        <AccountLayout>
            <div className="notifications">
                <h2 className="notifications__title">
                    Уведомления
                </h2>

                <div className="notifications__blocks">
                    <div className="block">
                        <h3>Уведомление №1</h3>
                        <p>Описание уведомления</p>
                    </div>

                    <div className="block">
                        <h3>Уведомление №2</h3>
                        <p>Описание уведомления</p>
                    </div>

                    <div className="block">
                        <h3>Уведомление №3</h3>
                        <p>Описание уведомления</p>
                    </div>
                </div>
            </div>
        </AccountLayout>
    )
}

export default Bell;