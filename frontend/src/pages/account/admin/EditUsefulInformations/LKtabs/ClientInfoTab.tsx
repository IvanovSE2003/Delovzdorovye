import LKtab from "./LKtab";

const ClientInfoTab: React.FC = () => {
  return (
    <LKtab
      contentType="useful_info_patient"
      tabName="ЛК врача"
      showSaveButton={true}
    />
  );
};

export default ClientInfoTab;