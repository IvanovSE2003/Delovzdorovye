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
    activeTab?: string | null;
    onTabChange?: (tabName: string) => void;
    className?: string;
    paramName?: string;
    syncWithUrl?: boolean;
}

const Tabs: React.FC<TabsProps> = ({ 
    tabs, 
    filter = false,
    activeTab: externalActiveTab, 
    onTabChange, 
    className = '',
    paramName = 'tab',
    syncWithUrl = false
}) => {
    const [searchParams, setSearchParams] = syncWithUrl ? useSearchParams() : [null, () => {}];
    const location = syncWithUrl ? useLocation() : { search: '' };
    
    const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.name || '');
    const isControlled = externalActiveTab !== undefined;
    
    const getTabFromUrl = () => {
        if (!syncWithUrl || !searchParams) return null;
        return searchParams.get(paramName);
    };

    useEffect(() => {
        if (!syncWithUrl) return;
        
        const urlTab = getTabFromUrl();
        if (urlTab && tabs.some(tab => tab.name === urlTab)) {
            setInternalActiveTab(urlTab);
        }
    }, [location.search, syncWithUrl]);

    const activeTab = isControlled ? externalActiveTab : internalActiveTab;

    const handleTabClick = (tabName: string) => {
        if (!isControlled) {
            setInternalActiveTab(tabName);
        }
        
        if (syncWithUrl && setSearchParams) {
            const newSearchParams = new URLSearchParams(searchParams || '');
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