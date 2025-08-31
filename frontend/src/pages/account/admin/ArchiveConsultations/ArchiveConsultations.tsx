import { useState } from "react";
import AccountLayout from "../../AccountLayout";
import Search from "../../../../components/UI/Search/Search"
import "./ArchiveConsultations.scss";

interface Consultation {
  id: number;
  date: string;
  time: string;
  client: string;
  specialist: string;
  recommendation: string;
  rating: number;
  review?: string;
}

const mockConsultations: Consultation[] = [
  {
    id: 1,
    date: "Вчера",
    time: "15:30-16:30",
    client: "Иванова Мария Петровна",
    specialist: "Петрова Анна Ивановна",
    recommendation: "Файл",
    rating: 5,
  },
  {
    id: 2,
    date: "08.09.2025",
    time: "15:30-16:30",
    client: "Иванова Мария Петровна",
    specialist: "Петрова Анна Ивановна",
    recommendation: "Файл",
    rating: 4,
  },
  {
    id: 3,
    date: "08.09.2025",
    time: "15:30-16:30",
    client: "Иванова Мария Петровна",
    specialist: "Петрова Анна Ивановна",
    recommendation: "Файл",
    rating: 3,
  },
];

const ArchiveConsultations = () => {
  const [search, setSearch] = useState("");
  const [consultations, setConsultations] = useState(mockConsultations);

  const handleReviewChange = (id: number, value: string) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, review: value } : c))
    );
  };

  const filteredConsultations = consultations.filter((c) =>
    `${c.client} ${c.specialist}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AccountLayout>
      <div className="archive">
        <Search
          placeholder="Введите телефон, имя, фамилию пользователя"
          value={search}
          onChange={setSearch}
          className="archive__search"
        />

        <div className="archive__list">
          {filteredConsultations.map((c) => (
            <div key={c.id} className="archive__card">
              <div className="archive__right">
                <div className="archive__time">
                  <span className="archive__date">{c.date}</span>
                  <span className="archive__hours">{c.time}</span>
                </div>

                <div className="archive__info">
                  <p>
                    <strong>Клиент:</strong> {c.client}
                  </p>
                  <p>
                    <strong>Специалист:</strong> {c.specialist}
                  </p>
                  <p>
                    <strong>Рекомендация:</strong>{" "}
                    <a href="#">{c.recommendation}</a>
                  </p>
                </div>
              </div>

              <div className="archive__left">
                <span className={`archive__rating archive__rating--${c.rating}`}>
                  Оценка: {c.rating}
                </span>

                <textarea
                  className="archive__review"
                  placeholder="Отзыв"
                  readOnly
                  value={c.review || ""}
                  onChange={(e) => handleReviewChange(c.id, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountLayout >
  );
};

export default ArchiveConsultations;
