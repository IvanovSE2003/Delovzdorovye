import AccountLayout from "../AccountLayout";

const UsefulInfo = () => {
    return (
        <AccountLayout>
            <div className="usefulinfo">
                <div className="usefulinfo-block">
                    <h2 className="usefulinfo-block__qustion">Как записаться на консультацию?</h2>
                    <p className="userfulinfo-block__answer">
                        <ol>
                            <li>Перейдите на главную страницу.</li>
                            <li>Нажмите кнопку «Записаться на консультацию».</li>
                            <li>В открывшейся форме укажите желаемую дату и время специалиста.</li>
                        </ol>
                    </p>
                </div>
            </div>

            <div className="usefulinfo">
                <div className="usefulinfo-block">
                    <h2 className="usefulinfo-block__qustion">Сколько стоит и длится консультация?</h2>
                    <p className="usefulinfo-block__answer">
                        Каждая консультация длится 1 час и стоит 3000 ₽. Если вам потребуется больше времени, можно будет продлить сеанс (каждые 30 мин - 1500 ₽).
                    </p>
                </div>
            </div>

            
        </AccountLayout>
    )
}

export default UsefulInfo;