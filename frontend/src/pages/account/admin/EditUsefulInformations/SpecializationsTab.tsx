import DoctorService from "../../../../services/DoctorService";
import { EditableList } from "./EditableList";
import type { Specializations } from "../../../../services/DoctorService";

const SpecializationsTab: React.FC = () => {
    return (
        <EditableList<Specializations>
            title="Добавить специализацию"
            loadItems={async () => {
                const res = await DoctorService.getSpecializations();
                return res.data; // EditableList ждёт T[]
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
        />
    );
};

export default SpecializationsTab;
