import ConsultationsStore from "../../../../../store/consultations-store";
import EditableList from "./EditableList";

const store = new ConsultationsStore();

const ProblemsTab: React.FC = () => {
    return (
        <EditableList
            loadItems={store.getProblems}
            createItem={store.createProblem}
            updateItem={async (id: number, label: string) => {
                await store.updateProblem(Number(id), label);
            }}
            deleteItem={async (id: number) => {
                await store.deleteProblem(Number(id));
            }}
            getId={p => p.value}
            getLabel={p => p.label}
            placeholder="Поиск по названию проблемы"
            addMessage="+ Добавить новую проблему"
            tabName="problems"
        />
    );
};

export default ProblemsTab;