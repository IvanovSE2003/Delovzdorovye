import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import './Tabs.scss';

export interface ITab {
    name: string;
    label: string;
}

interface TabsProps {
    tabs: ITab[];
    filter?: boolean;
    activeTab?: string;
    onTabChange?: (tabName: string) => void;
    className?: string;
    paramName?: string; // Новый проп для имени параметра в URL
    syncWithUrl?: boolean; // Флаг для синхронизации с URL
}

const Tabs: React.FC<TabsProps> = ({ 
    tabs, 
    filter = false,
    activeTab: externalActiveTab, 
    onTabChange, 
    className = '',
    paramName = 'tab', // Дефолтное имя параметра
    syncWithUrl = false // По умолчанию выключено
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    
    const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.name || '');
    const isControlled = externalActiveTab !== undefined;
    
    // Получаем активный таб из URL если syncWithUrl=true
    const getTabFromUrl = () => {
        if (!syncWithUrl) return null;
        return searchParams.get(paramName);
    };

    // Устанавливаем начальное значение
    useEffect(() => {
        const urlTab = getTabFromUrl();
        if (urlTab && tabs.some(tab => tab.name === urlTab)) {
            setInternalActiveTab(urlTab);
        }
    }, [location.search]); // Следим за изменением search параметров

    const activeTab = isControlled ? externalActiveTab : internalActiveTab;

    // Обработка нажатия на таб
    const handleTabClick = (tabName: string) => {
        if (!isControlled) {
            setInternalActiveTab(tabName);
        }
        
        // Обновляем URL если включена синхронизация
        if (syncWithUrl) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set(paramName, tabName);
            setSearchParams(newSearchParams);
        }
        
        onTabChange?.(tabName);
    };

    return (
        <div className={`tabs ${filter ? "tabs-filters" : ""} ${className}`}>
            {tabs.map(tab => (
                <button
                    key={tab.name}
                    type="button"
                    onClick={() => handleTabClick(tab.name)}
                    className={`tabs__tab ${activeTab === tab.name ? "tabs__tab--active" : ""}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;