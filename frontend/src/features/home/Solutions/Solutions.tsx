import './Solutions.scss'
import AnimatedBlock from '../../../components/AnimatedBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { useEffect, useState } from 'react';
import ConsultationsStore, { type OptionsResponse } from '../../../store/consultations-store';

const Solutions: React.FC<ElementHomePageProps> = ({ role }) => {
    const [problems, setProblems] = useState<OptionsResponse[]>([] as OptionsResponse[]);
    const store = new ConsultationsStore();

    // Загрузка данных 
    const fetchProblems = async () => {
        try {
            const data = await store.getProblems();
            setProblems(data);
            console.log(data);
        } catch (e) {

        }
    }

    // Загрузка данных при открытии блока
    useEffect(() => {
        fetchProblems();
    }, [])

    // Основной рендер
    return (
        <section className="solutions container" id="solutions">
            <AnimatedBlock>
                <div className="container__box">
                    <h2 className='solutions__title'>Какие проблемы решаем?</h2>
                    <div className="solutions__block-list">
                        <ul className='solutions__list'>
                            {problems.map(problem => (
                                <li key={problem.value}>{problem.label}</li>
                            ))}
                        </ul>
                    </div><div className="solutions__warn">
                        <span>
                            Мы помогаем разобраться в причинах проблем и даем рекомендации. Это консультационная поддержка, которая не заменяет медицинское лечение.
                        </span>
                    </div>
                    {role === "ADMIN" && (
                        <button
                            className='my-button'
                            // onClick={}
                        >
                            Редактирование
                        </button>
                    )}
                </div>
            </AnimatedBlock>
        </section>
    )
}

export default Solutions;