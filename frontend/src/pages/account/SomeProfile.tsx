import { useContext, useEffect, useState } from "react";
import Loader from "../../components/UI/Loader/Loader";
import $api from "../../http";
import type { IUserDataProfile } from "../../models/Auth";
import AccountLayout from "./AccountLayout";
import { useParams } from "react-router";
import { Context } from "../../main";
import { observer } from "mobx-react-lite";
import UpcomingConsultations from "../../features/account/UpcomingConsultations/UpcomingConsultations";
import ArchiveConsultations from "../../features/account/ArchiveConsultations/ArchiveConsultations";
import UserProfile from "../../features/account/MyProfile/UserProfile";
import '../../features/account/MyProfile/MyProfile.scss';
import type { ConsultationData } from "../../components/UI/Modals/EditModal/EditModal";
import AdminRecordModal from "../../components/UI/Modals/RecordModal/AdminRecordModal";

const Profile = () => {
    const { id } = useParams();
    const { store } = useContext(Context);
    const [profile, setProfile] = useState<IUserDataProfile | null>(null)

    const [modalRecord, setModalRecord] = useState<boolean>(false);

    const getDataProfile = async () => {
        if (!store.user?.id) return;
        const { data } = await $api.post(`/profile/${id}`, { linkerId: store.user.id });
        console.log(data);
        setProfile(data);
    }

    const handleRecordConsultation = (data: ConsultationData) => {
        console.log("Данные для записи:", data);
        setModalRecord(false);
    };

    useEffect(() => {
        if (store.user?.id) {
            getDataProfile();
        }
    }, [id, store.user.id]);

    if (!profile) return <Loader />

    return (
        <AccountLayout>
            <AdminRecordModal
                isOpen={modalRecord}
                onClose={() => setModalRecord(false)}
                onRecord={handleRecordConsultation}
                userId={id}
            />

            <div className="user-profile">
                <div className="user-profile__box">
                    <div className="user-profile__content">
                        <UserProfile
                            profileData={profile}
                            isButton={false}
                        />
                    </div>
                    {store.user.role === "ADMIN" && (
                        <button
                            className="neg-button width100"
                            style={{ marginTop: '30px' }}
                            onClick={() => setModalRecord(true)}
                        >
                            Записать на консультацию
                        </button>
                    )}
                </div>
            </div>

            {store.user.role === "ADMIN" && profile.role === "PATIENT" && (
                <>
                    <UpcomingConsultations
                        id={id}
                        profile={profile}
                    />

                    <ArchiveConsultations />
                </>
            )}
        </AccountLayout>
    )
}

export default observer(Profile);