import { RouteNames } from "../../routes";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../../public/logo.svg";
import { useContext, useState } from "react";
import { Context } from "../../main";

const ActivatedEmail = () => {
  const { store } = useContext(Context);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const sendActivated = async () => {
    const data = await store.sendActivate(store.user.email);
    console.log("Main block: ", data);
    data.success ? setMessage(data.message) : setError(data.message);
  };

  const logout = async () => {
    await store.logout();
    navigate(RouteNames.MAIN);
  }

  return (
    <div className="color-block">
      <div className="color-block__form">
        <div className="color-block__logo">
          <img src={logo} />
        </div>

        <div className="account-blocked">
          <h1 className="account-blocked__title">Активируйте аккаунт</h1>

          <h3 className="account-blocked__message">{message}</h3>
          <h3 className="account-blocked__error">{error}</h3>

          <p className="account-blocked__description">
            Для работы сервиса необходимо активировать электронную почту,
            которую вы указали при регистрации. Пожалуйта, перейдите на нее и
            следуйте инструкциям. В уважением команда "Дело в здоровье".
          </p>
          <div className="account-blocked__buttons">
            <button
              className="account-blocked__button"
              onClick={() => sendActivated()}
            >
              Отправить сообщение для активации
            </button>
            <Link to={RouteNames.MAIN} style={{ width: "100%" }}>
              <button className="account-blocked__button">
                Вернуться на главную страницу
              </button>
            </Link>
            <button
              className="account-blocked__button"
              onClick={logout}
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
