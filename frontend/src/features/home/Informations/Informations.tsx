import './Informations.scss'
import AnimatedBlock from '../../../components/AnimatedBlock';

const Informations = () => {
    return (
        <div className='informations container' id="informations">
            <AnimatedBlock>
                <div className="container__box">
                    <h2 className='informations__title'>Полезная информация</h2>

                    <div className="informations__block">
                        <h3 className="informations__block__title">
                            Как записаться на консультацию?
                        </h3>
                        <ol className="informations__block__text">
                            <li>Зарегистрируйтесь или войдите в личный кабинет.</li>
                            <li>Выберите удобные дату и время.</li>
                            <li>Оплатите консультацию.</li>
                            <li>В назначенное время подключитесь к видеоконсультации.</li>
                        </ol>
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
            </AnimatedBlock>
        </div>
    )
}

export default Informations;