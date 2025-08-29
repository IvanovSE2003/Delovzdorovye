import Select from 'react-select';
import { useState } from 'react';

interface OptionType {
  value: string;
  label: string;
}

const options: OptionType[] = [
  { value: '1', label: 'Хроническая усталость' },
  { value: '2', label: 'Нарушение сна и бессонница' },
  { value: '3', label: 'Нехватка энергии в течение дня' },
  { value: '4', label: 'Отсутствие мотивации' },
  { value: '5', label: 'Пищевая зависимость' },
  { value: '6', label: 'Последствия малоподвижного образа жизни' },
  { value: '7', label: 'Тревожность' },
  { value: '8', label: 'Снижение концентрации' },
  { value: '9', label: 'Другая проблема' }
];

const ProblemSelect = () => {
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);

  const handleProblemChange = (selected: readonly OptionType[]) => {
    const selectedArray = Array.from(selected);
    
    // Проверяем, есть ли среди выбранных "Другая проблема" (value: '9')
    const hasOtherProblem = selectedArray.some(option => option.value === '9');
    
    // Проверяем, есть ли среди выбранных обычные проблемы (не '9')
    const hasRegularProblems = selectedArray.some(option => option.value !== '9');

    if (hasOtherProblem && hasRegularProblems) {
      // Если выбраны и "другая проблема" и обычные проблемы,
      // оставляем только "другую проблему"
      const otherProblemOnly = selectedArray.filter(option => option.value === '9');
      setSelectedOptions(otherProblemOnly);
    } else {
      setSelectedOptions(selectedArray);
    }
  };

  const isOptionDisabled = (option: OptionType): boolean => {
    const hasOtherProblem = selectedOptions.some(opt => opt.value === '9');
    const hasRegularProblems = selectedOptions.some(opt => opt.value !== '9');

    if (option.value === '9') {
      // "Другая проблема" disabled, если есть обычные проблемы
      return hasRegularProblems;
    } else {
      // Обычные проблемы disabled, если есть "другая проблема"
      return hasOtherProblem;
    }
  };

  return (
    <Select
      isMulti
      options={options}
      value={selectedOptions}
      placeholder="Выберите одну или несколько проблем"
      className="record-modal__select-problems"
      onChange={handleProblemChange}
      isOptionDisabled={isOptionDisabled}
    />
  );
};

export default ProblemSelect;