import LKtab from "./LKtab";

const SpecialistInfoTab: React.FC = () => {
  return (
    <LKtab
      contentType="useful_info_doctor"
      tabName="ЛК пациента"
      showSaveButton={true}
    />
  );
};

export default SpecialistInfoTab;