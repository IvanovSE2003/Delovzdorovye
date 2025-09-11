import { useEffect, useState } from "react";
import AccountLayout from "../../AccountLayout";
import Search from "../../../../components/UI/Search/Search"
import "./ArchiveConsultations.scss";
import type { Consultation } from "../../../../features/account/UpcomingConsultations/UpcomingConsultations";
import ConsultationService from "../../../../services/ConsultationService";
import { API_URL } from "../../../../http";
import { getDateLabel } from "../../../../hooks/DateHooks";
import type { TypeResponse } from "../../../../models/response/DefaultResponse";
import type { AxiosError } from "axios";

const PAGE_SIZE = 8;

const ArchiveConsultations: React.FC = () => {
  const [search, setSearch] = useState("");
  const [consultations, setConsultations] = useState<Consultation[]>([] as Consultation[]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const filteredConsultations = consultations.filter((c) =>
    `${c.PatientName} ${c.PatientSurname} ${c?.PatientPatronymic} ${c.DoctorName} ${c.DoctorSurname} ${c?.DoctorPatronymic}`.toLowerCase().includes(search.toLowerCase())
  );

  const fetchConsultations = async (pageNumber: number) => {
    try {
      const response = await ConsultationService.getAllConsultations(PAGE_SIZE, pageNumber, {
        consultation_status: "ARCHIVE",
      });
      setConsultations(response.data.consultations);
      setTotalPages(response.data.totalPages || 1);
    } catch (e) {
      const error = e as AxiosError<TypeResponse>;
      console.error("Ошибка загрузки консультаций", error.response?.data.message);
    }
  };

  useEffect(() => {
    fetchConsultations(page);
  }, [page]);

  return (
    <AccountLayout>
      <div className="page-container archive">
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
                    <span className="archive__date">{getDateLabel(c.date)}</span>
                    <span className="archive__hours">{c.durationTime}</span>
                  </div>

                  <div className="archive__info">
                    <p>
                      <strong>Клиент: </strong>
                      {`${c.PatientSurname} ${c.PatientName} ${c?.PatientPatronymic}`}
                    </p>
                    <p>
                      <strong>Специалист: </strong>
                      {`${c.DoctorSurname} ${c.DoctorName} ${c?.DoctorPatronymic}`}
                    </p>
                    <p>
                      <strong>Рекомендации: </strong>{" "}
                      {c.recommendations ? (
                        <a href={`${API_URL}/${c.recommendations}`}>Файл</a>
                      ) : (
                        <span>Файл не загружен</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="archive__left">
                  {c.score && c.score > 0 ? (
                    <>
                      <span className={`archive__rating archive__rating--${c.score}`}>
                        Оценка: {c.score}
                      </span>

                      <textarea
                        className="archive__review"
                        placeholder="Отзыв"
                        readOnly
                        value={c.comment || ""}
                      />
                    </>
                  ) : (
                    <>
                      <span className="archive__rating">
                        Оценку еще не поставили
                      </span>

                      <div className="archive__rating">
                        Отзыва нет
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="archive__none">Архивных консультаций не найдено!</div>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="archive__pagination">
            <button
              disabled={page === 1}
              className="my-button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Назад
            </button>

            <button
              className={`my-button numbers ${page === 1 ? "active" : ""}`}
              onClick={() => setPage(1)}
            >
              1
            </button>

            {page > 3 && <span className="dots">...</span>}

            {page > 2 && page < totalPages && (
              <button className="my-button numbers active">{page}</button>
            )}

            {page < totalPages - 2 && <span className="dots">...</span>}

            {totalPages > 1 && (
              <button
                className={`my-button numbers ${page === totalPages ? "active" : ""}`}
                onClick={() => setPage(totalPages)}
              >
                {totalPages}
              </button>
            )}

            <button
              disabled={page === totalPages}
              className="my-button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Вперед
            </button>
          </div>
        )}
      </div>
    </AccountLayout>
  );
};

export default ArchiveConsultations;
