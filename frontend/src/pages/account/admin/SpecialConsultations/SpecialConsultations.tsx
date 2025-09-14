import { useEffect, useState } from 'react';
import AccountLayout from '../../AccountLayout';
import './SpecialConsultations.scss';
import type { TypeResponse } from '../../../../models/response/DefaultResponse';
import { processError } from '../../../../helpers/processError';

const SpecialConsultation = () => {
    const [error, setError] = useState<string>("");


    // Загрузка данных
    const fetchSpecialConsultation = () => {
        try {

        } catch (e) {
            processError(e, "Ошибка при загрузке особых заявок на консультацию", setError)
        }
    }

    // Загрузка данный при открытии страницы
    useEffect(() => {
        fetchSpecialConsultation();
    })

    return (
        <AccountLayout>
            <div className='page-container'>
                <h1 className="page-container__title">Особые заявки</h1>

                {error && (<div>{error}</div>)}

            </div>
        </AccountLayout>
    )
}

export default SpecialConsultation;