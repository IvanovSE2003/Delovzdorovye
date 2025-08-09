import './Informations.scss'

const Informations = () => {
    return (
        <div className='informations container' id="informations">
            <div className="container__box">
                <h2 className='informations__title'>Полезная информация</h2>

                <div className="informations__block">
                    <h3 className="informations__block__title">
                        Как записаться на консультацию?
                    </h3>
                    <ul className="informations__block__text informations__block__list-numbers">
                        <li>1. Зарегистрируйтесь или войдите в личный кабинет.</li>
                        <li>2. Выберите удобные дату и время.</li>
                        <li>3. Оплатите консультацию.</li>
                        <li>4. В назначенное время подключитесь к видеоконсультации.</li>
                    </ul>
                </div>

                <div className="informations__block">
                    <h3 className="informations__block__title">
                        Насколько конфиденциальны мои данные?
                    </h3>
                    <p className="informations__block__text">Всё, что вы скажете на консультации, останется между вами и спциалистом. Мы не передаем данные третьим лицам и используем шифрование для защиты переписки.</p>
                </div>

                <div className="informations__block">
                    <h3 className="informations__block__title">
                        Почему онлайн-консультации удобнее очных встреч?
                    </h3>
                    <ul className="informations__block__text">
                        <li>консультируйтесь не выходя из дома</li>
                        <li>подключайтесь без поездок и очередей</li>
                        <li>переносите или продлевайте консультации в один клик</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Informations;