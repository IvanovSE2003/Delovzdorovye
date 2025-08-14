import { useState } from 'react';
import './DoctorInfo.scss'

const DoctorInfo = () => {
    const [edit, setEdit] = useState<boolean>(false);

    const saveChange = () => {
        setEdit(false);
    }

    return (
        <div className='doctor-info'>
            {edit && (<h1>Редактирование</h1>)}
            <div className='doctor-info__content'>
                <span><strong>Специализация:</strong> Информация </span> 
                <span><strong>Диплом о профильном образовании:</strong> Должен быть файл</span>
                <span><strong>Лицензия: </strong> Должен быть файл</span>
            </div>
            {edit
                ?
                <button
                    className='auth__button'
                    onClick={saveChange}
                >
                    Сохранить
                </button>
                :
                <button
                    className='auth__button'
                    onClick={() => setEdit(true)}
                >
                    Редактировать
                </button>
            }
        </div>
    )
}

export default DoctorInfo;