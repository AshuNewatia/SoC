import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const getChartCanvas = (width, height) => {
    return new ChartJSNodeCanvas({ 
        width, 
        height, 
        backgroundColour: 'white',
        chartCallback: (ChartJS) => {
            ChartJS.defaults.responsive = true;
            ChartJS.defaults.maintainAspectRatio = true;
        }
    });
};

export async function generateTaskStatusChart(report) {
    const kpis = report?.kpis || {};
    const completedTasks = kpis.completedTasks || 0;
    const pendingTasks = kpis.pendingTasks || 0;
    const overdueTasks = kpis.overdueTasks || 0;

    const total = completedTasks + pendingTasks + overdueTasks || 1;

    const labels = [
        `Completed (${((completedTasks / total) * 100).toFixed(1)}%)`,
        `Pending (${((pendingTasks / total) * 100).toFixed(1)}%)`,
        `Overdue (${((overdueTasks / total) * 100).toFixed(1)}%)`
    ];

    const canvas = getChartCanvas(400, 300);
    
    const configuration = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: [completedTasks, pendingTasks, overdueTasks],
                backgroundColor: ['#0F4FBF', '#43B8F8', '#EF4444'],
                borderColor: '#FFFFFF',
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        usePointStyle: true, 
                        padding: 20,
                        font: { size: 11 }
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value} tasks`;
                        }
                    }
                }
            },
        },
    };

    return canvas.renderToBuffer(configuration);
}

export async function generatePriorityChart(report) {
    let priorityData = {};
    
    if (Array.isArray(report?.priorityDistribution)) {
        report.priorityDistribution.forEach(item => {
            priorityData[item._id || item.priority] = item.count;
        });
    } else {
        priorityData = report?.priorityDistribution || {};
    }
    
    const data = {
        Low: priorityData.Low || priorityData.low || 0,
        Medium: priorityData.Medium || priorityData.medium || 0,
        High: priorityData.High || priorityData.high || 0,
        Critical: priorityData.Critical || priorityData.critical || 0,
    };
    
    const labels = Object.keys(data);
    const values = Object.values(data);
    const total = values.reduce((sum, val) => sum + val, 0) || 1;

    const labelsWithPercentages = labels.map(key => 
        `${key} (${((data[key] / total) * 100).toFixed(1)}%)`
    );

    const canvas = getChartCanvas(400, 300);

    const configuration = {
        type: 'doughnut',
        data: {
            labels: labelsWithPercentages,
            datasets: [{
                data: values,
                backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
                borderColor: '#FFFFFF',
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        usePointStyle: true, 
                        padding: 20,
                        font: { size: 11 }
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value} tasks`;
                        }
                    }
                }
            },
        },
    };

    return canvas.renderToBuffer(configuration);
}

export async function generateCompletionTrendChart(report) {
    const trend = report?.completionTrend || [];
    const dates = trend.map(d => d.date);
    const counts = trend.map(d => d.completed || d.count || 0);

    const canvas = getChartCanvas(700, 300);

    const configuration = {
        type: 'line',
        data: {
            labels: dates.length ? dates : ['No Data'],
            datasets: [{
                label: 'Tasks Completed',
                data: counts.length ? counts : [0],
                borderColor: '#0F4FBF',
                backgroundColor: 'rgba(15, 79, 191, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#0F4FBF',
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Tasks Completed: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: { 
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                },
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { 
                        stepSize: 1,
                        font: { size: 10 }
                    }
                },
            },
        },
    };

    return canvas.renderToBuffer(configuration);
}