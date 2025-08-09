import './Costs.scss'
import AnimatedBlock from '../AnimatedBlock';

const Costs = () => {
    return (
        <AnimatedBlock>
            <div className="costs container" id="costs">
                <div className="container__box">
                    <h2 className='costs__title'>Стоимость консультации</h2>

                    <div className="costs__block">
                        <h3 className='costs__block__title'>1 час – 3000 ₽</h3>
                        <p className='costs__block__description'>Все специалисты работают по единому тарифу</p>
                    </div>

                    <div className="costs__block">
                        <h3 className='costs__block__title'>Дополнительное время</h3>
                        <p className='costs__block__description'>+15 минут – 750 ₽<br /> +30 минут – 1500 ₽</p>
                    </div>
                </div>
            </div>
        </AnimatedBlock>
    )
}

export default Costs;