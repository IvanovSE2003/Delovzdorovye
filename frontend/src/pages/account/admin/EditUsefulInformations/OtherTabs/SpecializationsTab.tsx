import DoctorService from "../../../../../services/DoctorService";
import EditableList from "./EditableList";

const SpecializationsTab: React.FC = () => {
    return (
        <EditableList
            loadItems={async () => {
                const res = await DoctorService.getSpecializations();
                return res.data;
            }}
            createItem={async (name) => {
                await DoctorService.createSpecialization(name);
            }}
            updateItem={async (id, name) => {
                await DoctorService.updateSpecialization(Number(id), name);
            }}
            deleteItem={async (id) => {
                await DoctorService.deleteSpecialization(Number(id));
            }}
            getId={s => s.id}
            getLabel={s => s.name}
            placeholder="Введите название специализации"
            addMessage="+ Добавить новую специализацию"
            tabName="specializations"
        />
    );
};

export default SpecializationsTab;