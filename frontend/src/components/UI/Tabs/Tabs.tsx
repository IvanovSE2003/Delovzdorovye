import { useState } from 'react';
import './Tabs.scss';

export interface ITab {
    name: string;
    label: string;
}

interface TabsProps {
    tabs: ITab[];
    activeTab?: string;
    onTabChange?: (tabName: string) => void;
    className?: string;
}

const Tabs: React.FC<TabsProps> = ({ 
    tabs, 
    activeTab: externalActiveTab, 
    onTabChange, 
    className = '' 
}) => {
    const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.name || '');
    const isControlled = externalActiveTab !== undefined;
    const activeTab = isControlled ? externalActiveTab : internalActiveTab;

    // Обработка нажатия на таб
    const handleTabClick = (tabName: string) => {
        if (!isControlled) {
            setInternalActiveTab(tabName);
        }
        onTabChange?.(tabName);
    };

    return (
        <div className={`filter-tabs ${className}`}>
            {tabs.map(tab => (
                <button
                    key={tab.name}
                    type="button"
                    onClick={() => handleTabClick(tab.name)}
                    className={`filter-tabs__tab ${activeTab === tab.name ? "filter-tabs__tab--active" : ""}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default Tabs;