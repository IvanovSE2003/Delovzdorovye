import './Solutions.scss'
import AnimatedBlock from '../../../components/AnimatedBlock';

const Solutions = () => {
    return (
        <section className="solutions container" id="solutions">
            <AnimatedBlock>
                <div className="container__box">
                    <h2 className='solutions__title'>Какие проблемы решаем?</h2>
                    <div className="solutions__block-list">
                        <ul className='solutions__list'>
                            <li>Постоянная усталость, сонливость</li>
                            <li>Нарушение сна и бессонница</li>
                            <li>Нехватка энергии в течение дня</li>
                            <li>Ощущение тяжести и пищевой «зависимости»</li>
                            <li>Плохая осанка и последствия сидячего образа жизни</li>
                            <li>Отсутствие энергии для физической активности</li>
                            <li>Навязчивые мысли и беспричинное беспокойство</li>
                            <li>Проблемы с концентрацией, раздражительность</li>
                        </ul>
                    </div>
                    <div className="solutions__warn">
                        <span>
                            Мы помогаем разобраться в причинах проблем и даем рекомендации. Это консультационная поддержка, которая не заменяет медицинское лечение.
                        </span>
                    </div>
                </div>
            </AnimatedBlock>
        </section>
    )
}

export default Solutions;