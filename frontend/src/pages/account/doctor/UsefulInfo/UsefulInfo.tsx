import { useEffect, useState } from "react";
import AccountLayout from "../../AccountLayout";
import type { InfoBlock } from "../../admin/EditUsefulInformations/EditUsefulInformations";
import './UsefulInfo.scss';

const UsefulInfo = () => {
    const [data, setData] = useState<InfoBlock[]>([] as InfoBlock[]);

    const fetchData = async () => {
        // const response = await DoctorSerivce.getUsefulInfo();
        // setData(response.data);
    }

    useEffect(() => {
        fetchData();
    }, [])

    return (
        <AccountLayout>
            <h1 className="usefulinfo__title">Полезная информация</h1>
            {data && data.length > 0 ? data.map((p: any) =>
                <div className="usefulinfo">
                    <div className="usefulinfo-block">
                        <h2 className="usefulinfo-block__title">{p.title}</h2>
                        <p className="usefulinfo-block__text">{p.text}</p>
                    </div>
                </div>
            ) : (
                <div className="usefulinfo__none">
                    Здесь нет данных
                </div>
            )}
        </AccountLayout>
    )
}

export default UsefulInfo;