import { RouteNames } from "../../routes";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { useContext, useState } from "react";
import { Context } from "../../main";

const ActivatedEmail = () => {
  const { store } = useContext(Context);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const sendActivated = async () => {
    const data = await store.sendActivate(store.user.email);
    console.log("Main block: ", data);
    data.success ? setMessage(data.message) : setError(data.message);
  };

  return (
    <div className="account-wrapper">
      <div className="account-blocked">
        <div className="account-blocked-box">
          <div className="account-blocked-logo">
            <img src={logo} />
          </div>

          <h1 className="account-blocked-box-title">Активируйте аккаунт</h1>

          <h3 className="account-blocked-message">{message}</h3>
          <h3 className="account-blocked-error">{error}</h3>

          <p className="account-blocked-box-description">
            Для работы сервиса необходимо активировать электронную почту,
            которую вы указали при регистрации. Пожалуйта, перейдите на нее и
            следуйте инструкциям. В уважением команда "Дело в здоровье".
          </p>
          <div className="account-blocked-box-buttons">
            <button
              className="account-blocked-box-button"
              onClick={() => sendActivated()}
            >
              Отправить сообщение для активации
            </button>
            <Link to={RouteNames.MAIN} style={{ width: "100%" }}>
              <button className="account-blocked-box-button">
                Вернуться на главную страницу
              </button>
            </Link>
            <button
              className="account-blocked-box-button"
              onClick={() => store.logout()}
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivatedEmail;
