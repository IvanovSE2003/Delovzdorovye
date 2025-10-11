import { useEffect, useState } from "react";
import AccountLayout from "../../AccountLayout";
import Search from "../../../../components/UI/Search/Search";
import ConsultationService from "../../../../services/ConsultationService";
import { API_URL } from "../../../../http";
import Pagination from "../../../../components/UI/Pagination/Pagination";
import { Link } from "react-router-dom";
import Tabs from "../../../../components/UI/Tabs/Tabs";
import { getDateLabel } from "../../../../helpers/formatDatePhone";
import type { Consultation } from "../../../../models/consultations/Consultation";
import { processError } from "../../../../helpers/processError";
import LoaderUsefulInfo from "../../../../components/UI/LoaderUsefulInfo/LoaderUsefulInfo";
import "./ArchiveConsultations.scss";

const PAGE_SIZE = 8;

const ArchiveConsultations: React.FC = () => {
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<"all" | 1 | 2 | 3 | 4 | 5>("all");
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  // Фильтрация консультаций
  const filteredConsultations = consultations
    .filter((c) =>
      `${c.PatientName} ${c.PatientSurname} ${c?.PatientPatronymic} ${c.DoctorName} ${c.DoctorSurname} ${c?.DoctorPatronymic}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((c) => scoreFilter === "all" || c.score === scoreFilter);

  // Проверяем, применен ли фильтр по оценке (не "all")
  const isScoreFilterApplied = scoreFilter !== "all";
  
  // Проверяем, есть ли результаты после фильтрации
  const hasNoResults = filteredConsultations.length === 0;
  
  // Определяем, показывать ли сообщение о пустом фильтре
  const showFilterEmptyState = hasNoResults && isScoreFilterApplied;
  
  // Определяем, показывать ли общее пустое состояние (нет консультаций вообще)
  const showGeneralEmptyState = hasNoResults && !isScoreFilterApplied;

  // Загрузка данных
  const fetchConsultations = async (pageNumber: number) => {
    try {
      setLoading(true)
      const response = await ConsultationService.getAllConsultations(PAGE_SIZE, pageNumber, {
        consultation_status: "ARCHIVE",
      });
      setConsultations(response.data.consultations);
      setTotalPages(response.data.totalPages || 1);
    } catch (e) {
      processError(e, "Ошибка загурзки консультаций")
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations(page);
  }, [page]);

  if (loading) return (
    <AccountLayout>
      <div className="page-container archive">
        <h1 className="consultations-doctor__main-title">Архив консультаций</h1>
        <LoaderUsefulInfo />
      </div>
    </AccountLayout>
  )

  // Состояние когда нет консультаций вообще
  if (showGeneralEmptyState) return (
    <AccountLayout>
      <div className="page-container archive">
        <h1 className="consultations-doctor__main-title">Архив консультаций</h1>

        <div className="archive__filters">
          <Search
            placeholder="Поиск по ФИО специалиста и телефону"
            value={search}
            onChange={setSearch}
            className="archive__search"
          />

          <Tabs
            tabs={[
              { name: "all", label: "Все" },
              { name: "1", label: "1" },
              { name: "2", label: "2" },
              { name: "3", label: "3" },
              { name: "4", label: "4" },
              { name: "5", label: "5" }
            ]}
            filter
            activeTab={scoreFilter === "all" ? "all" : scoreFilter}
            onTabChange={(tabName) => setScoreFilter(tabName === "all" ? "all" : parseInt(tabName) as 1 | 2 | 3 | 4 | 5)}
            className="archive__tabs"
          />
        </div>

        <div className="lk-tab lk-tab--empty">
          <div className="lk-tab__empty-content">
            <div className="lk-tab__empty-icon">📅</div>
            <h3 className="lk-tab__empty-title">Нет архивных консультаций</h3>
            <p className="lk-tab__empty-description">В скором времени они появятся</p>
          </div>
        </div>
      </div>
    </AccountLayout>
  )

  return (
    <AccountLayout>
      <div className="page-container archive">
        <h1 className="consultations-doctor__main-title">Архив консультаций</h1>

        <div className="archive__filters">
          <Search
            placeholder="Поиск по ФИО специалиста и телефону"
            value={search}
            onChange={setSearch}
            className="archive__search"
          />

          <Tabs
            tabs={[
              { name: "all", label: "Все" },
              { name: "1", label: "1" },
              { name: "2", label: "2" },
              { name: "3", label: "3" },
              { name: "4", label: "4" },
              { name: "5", label: "5" }
            ]}
            filter
            activeTab={scoreFilter === "all" ? "all" : scoreFilter?.toString()}
            onTabChange={(tabName) => setScoreFilter(tabName === "all" ? "all" : parseInt(tabName) as 1 | 2 | 3 | 4 | 5)}
            className="archive__tabs"
          />
        </div>

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
                      {<Link to={`/profile/${c.PatientUserId}`}>
                        {c.PatientSurname} {c.PatientName} {c?.PatientPatronymic}
                      </Link>}
                    </p>

                    <p>
                      <strong>Специалист: </strong>
                      {<Link to={`/profile/${c.DoctorUserId}`}>
                        {c.DoctorSurname} {c.DoctorName} {c?.DoctorPatronymic}
                      </Link>}
                    </p>

                    <p>
                      <strong>Рекомендации: </strong>{" "}
                      {c.recommendations ? (
                        <Link to={`${API_URL}/${c.recommendations}`}>Файл</Link>
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
                        value={c.PatientComment || ""}
                      />
                    </>
                  ) : (
                    <>
                      <span className="archive__rating">Оценку еще не поставили</span>
                      <div className="archive__rating">Отзыва нет</div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            showFilterEmptyState && (
              <div className="lk-tab lk-tab--empty">
                <div className="lk-tab__empty-content">
                  <div className="lk-tab__empty-icon">🔍</div>
                  <h3 className="lk-tab__empty-title">Консультации с выбранной оценкой не найдены</h3>
                  <p className="lk-tab__empty-description">
                    Попробуйте изменить фильтр или поисковый запрос
                  </p>
                  <button 
                    className="my-button"
                    onClick={() => setScoreFilter("all")}
                  >
                    Показать все консультации
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        {filteredConsultations.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onChange={(page) => setPage(page)} />
        )}
      </div>
    </AccountLayout>
  );
};

export default ArchiveConsultations;