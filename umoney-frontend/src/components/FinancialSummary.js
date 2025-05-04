import React from 'react';
import { Card } from 'primereact/card';
import { useCurrency } from '../contexts/CurrencyContext';

const FinancialSummary = ({ summary }) => {
    const { currencyCode } = useCurrency();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            currencyDisplay: 'symbol'
        }).format(value || 0);
    };

    return (
        <div className="grid">
            <div className="col-12 md:col-6 lg:col-3">
                <Card title="Income" className="bg-green-100">
                    {formatCurrency(summary.income)}
                </Card>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <Card title="Needs" className="bg-blue-100">
                    {formatCurrency(summary.needs)}
                </Card>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <Card title="Wants" className="bg-purple-100">
                    {formatCurrency(summary.wants)}
                </Card>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <Card title="Savings" className="bg-orange-100">
                    {formatCurrency(summary.savings)}
                </Card>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <Card title="Total Spent" className="bg-red-100">
                    {formatCurrency(summary.totalSpent)}
                </Card>
            </div>
            <div className="col-12 md:col-6 lg:col-3">
                <Card title="Balance" className="bg-teal-100">
                    {formatCurrency(summary.balance)}
                </Card>
            </div>
        </div>
    );
};

export default FinancialSummary;