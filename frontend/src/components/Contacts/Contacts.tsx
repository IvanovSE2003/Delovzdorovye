import './Contacts.scss';
import vk from '../../assets/images/vk.png'
import tg from '../../assets/images/tg.png'

const Contacts = () => {
    return (
        <div className="contacts" id="contacts">
            <div className='container__box'>
                <h2 className='contacts__title'>Контакты</h2>

                <div className="contacts__info">
                    <p>Остались вопросы?</p>
                    <span>ask@delovzdorovie.ru<br/>8 888 888 88 88</span>
                    <div className="contacts__socials">
                        <p>Социальные сети</p>
                        <div className="contacts__socials__icons">
                            <img src={vk}/>
                            <img src={tg}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contacts;