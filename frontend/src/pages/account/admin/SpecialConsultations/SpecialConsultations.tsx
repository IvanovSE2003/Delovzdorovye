import { useEffect, useState } from 'react';
import AccountLayout from '../../AccountLayout';
import './SpecialConsultations.scss';
import { processError } from '../../../../helpers/processError';
import ShowError from '../../../../components/UI/ShowError/ShowError';

const SpecialConsultation = () => {
    const [error, setError] = useState<{ id: number; message: string } | null>(null);


    // Загрузка данных
    const fetchSpecialConsultation = async () => {
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

                <ShowError
                    msg={error}
                />

            </div>
        </AccountLayout>
    )
}

export default SpecialConsultation;