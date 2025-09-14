import ConsultationsStore,  { type OptionsResponse } from "../../../../store/consultations-store";
import { EditableList } from "./EditableList";

const store = new ConsultationsStore();

const ProblemsTab: React.FC = () => {
    return (
        <EditableList<OptionsResponse>
            title="Добавить проблему"
            loadItems={store.getProblems}
            createItem={store.createProblem}
            updateItem={async (id, label) => {
                await store.updateProblem(Number(id), label);
            }}
            deleteItem={async (id) => {
                await store.deleteProblem(Number(id));
            }}
            getId={p => p.value}
            getLabel={p => p.label}
        />
    );
};

export default ProblemsTab;
