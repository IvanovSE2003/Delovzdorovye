import './Solutions.scss'
import AnimatedBlock from '../../../components/AnimatedBlock';
import type { ElementHomePageProps } from '../../../pages/Homepage';
import { useEffect, useState } from 'react';
import ConsultationsStore, { type OptionsResponse } from '../../../store/consultations-store';
import { Link } from 'react-router';
import { processError } from '../../../helpers/processError';
import LoaderUsefulInfo from '../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo';

const Solutions: React.FC<ElementHomePageProps> = ({ role }) => {
    const [problems, setProblems] = useState<OptionsResponse[]>([] as OptionsResponse[]);
    const [loading, setLoading] = useState<boolean>(false);
    const store = new ConsultationsStore();

    const fetchProblems = async () => {
        try {
            setLoading(true);
            const data = await store.getProblems();
            setProblems(data);
        } catch (e) {
            processError(e, "Ошибка при получении данных (решения)")
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProblems();
    }, [])

    if (loading) return (
        <section className="solutions container" id="solutions">
            <AnimatedBlock>
                <div className="container__box">
                    <h2 className='solutions__title'>Какие проблемы решаем?</h2>
                    <LoaderUsefulInfo />
                </div>
            </AnimatedBlock>
        </section>
    )

    return (
        <section className="solutions container" id="solutions">
            <AnimatedBlock>
                <div className="container__box">
                    <h2 className='solutions__title'>Какие проблемы решаем?</h2>
                    <div className="solutions__block-list">
                        <ul className='solutions__list'>
                            {problems.length > 0 ? problems.map(problem => (
                                <li key={problem.value}>{problem.label}</li>
                            )) : (
                                <div
                                    className='solutions__none'
                                >
                                    Пока здесь ничего нет
                                </div>
                            )}
                        </ul>
                    </div>
                    <div className="solutions__warn">
                        <span>
                            Мы помогаем разобраться в причинах проблем и даем рекомендации. Это консультационная поддержка, которая не заменяет медицинское лечение.
                        </span>
                    </div>
                    {role === "ADMIN" && (
                        <Link
                            className='my-button'
                            to={'admin/edit-useful-information?tab=problems'}
                        >
                            Редактирование
                        </Link>
                    )}
                </div>
            </AnimatedBlock>
        </section>
    )
}

export default Solutions;