import { useEffect, useState } from "react";
import AccountLayout from "../../AccountLayout";
import Search from "../../../../components/UI/Search/Search"
import "./ArchiveConsultations.scss";
import type { Consultation } from "../../../../features/account/UpcomingConsultations/UpcomingConsultations";
import ConsultationService from "../../../../services/ConsultationService";
import { API_URL } from "../../../../http";


const ArchiveConsultations = () => {
  const [search, setSearch] = useState("");
  const [consultations, setConsultations] = useState<Consultation[]>([] as Consultation[]);

  const handleReviewChange = (id: number, value: string) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, review: value } : c))
    );
  };

  const filteredConsultations = consultations.filter((c) =>
    `${c.PatientName} ${c.PatientSurname} ${c?.PatientPatronymic} ${c.DoctorName} ${c.DoctorSurname} ${c?.DoctorPatronymic}`.toLowerCase().includes(search.toLowerCase())
  );

  const fetchConsultations = async () => {
    const response = await ConsultationService.getAllConsultions(10, 1, { consultation_status: "ARCHIVE" });
    setConsultations(response.data.consultations);
  }

  useEffect(() => {
    fetchConsultations();
  }, [])

  return (
    <AccountLayout>
      <div className="archive">
        <h1 className="admin-page__title">Архив консультаций</h1>

        <Search
          placeholder="Введите телефон, имя, фамилию пользователя"
          value={search}
          onChange={setSearch}
          className="archive__search"
        />

        <div className="archive__list">
          {filteredConsultations.length > 0 ? (
            filteredConsultations.map((c) => (
              <div key={c.id} className="archive__card">
                <div className="archive__right">
                  <div className="archive__time">
                    <span className="archive__date">{c.date}</span>
                    <span className="archive__hours">{c.durationTime}</span>
                  </div>

                  <div className="archive__info">
                    <p>
                      <strong>Клиент: </strong>
                      {`${c.PatientName} ${c.PatientSurname} ${c?.PatientPatronymic}`}
                    </p>
                    <p>
                      <strong>Специалист: </strong>
                      {`${c.DoctorName} ${c.DoctorSurname} ${c?.DoctorPatronymic}`}
                    </p>
                    <p>
                      <strong>Рекомендации: </strong>{" "}
                      <a href={`${API_URL}/{c.recommendations}`}>Файл</a>
                    </p>
                  </div>
                </div>

                <div className="archive__left">
                  <span className={`archive__rating archive__rating--${c.score}`}>
                    Оценка: {c.score}
                  </span>

                  <textarea
                    className="archive__review"
                    placeholder="Отзыв"
                    readOnly
                    value={c.comment || ""}
                    onChange={(e) => handleReviewChange(c.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="archive__none">Архивных консультаций не найдено!</div>
          )}
        </div>
      </div>
    </AccountLayout >
  );
};

export default ArchiveConsultations;
