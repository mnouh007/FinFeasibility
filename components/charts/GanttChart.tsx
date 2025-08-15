import React, { useRef, useEffect } from 'react';
import { select, timeParse, extent, timeDay, scaleTime, scaleBand, axisBottom, timeMonth, timeFormat, axisLeft } from 'd3';
import { useTranslation } from 'react-i18next';
import { Task } from '../../types';

interface GanttChartProps {
  tasks: Task[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ tasks }) => {
  const ref = useRef<SVGSVGElement>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (!tasks || tasks.length === 0 || !ref.current) return;

    const svg = select(ref.current);
    svg.selectAll("*").remove(); // Clear previous render

    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const width = ref.current.parentElement?.clientWidth || 800;
    const barHeight = 25;
    const padding = 10;
    const height = tasks.length * (barHeight + padding) + margin.top + margin.bottom;

    svg.attr("width", width).attr("height", height);
    
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const parsedTasks = tasks.map(d => ({
        ...d,
        startDate: timeParse("%Y-%m-%d")(d.startDate)!,
        endDate: timeParse("%Y-%m-%d")(d.endDate)!
    })).filter(d => d.startDate && d.endDate);

    if (parsedTasks.length === 0) return;

    const timeDomain = extent(parsedTasks.flatMap(d => [d.startDate, d.endDate])) as [Date, Date];
    const adjustedStartDate = timeDay.offset(timeDomain[0], -2);
    const adjustedEndDate = timeDay.offset(timeDomain[1], 2);

    const xScale = scaleTime()
        .domain([adjustedStartDate, adjustedEndDate])
        .range([0, width - margin.left - margin.right]);

    const yScale = scaleBand()
        .domain(tasks.map(d => d.name))
        .range([0, height - margin.top - margin.bottom])
        .padding(0.4);

    // X Axis
    chart.append("g")
        .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
        .call(axisBottom(xScale).ticks(timeMonth.every(1)).tickFormat(timeFormat("%b %Y")))
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-40)");
          
    // Y Axis
    chart.append("g")
        .call(axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "12px")
        .attr("fill", document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#334155');


    // Tooltip
    const tooltip = select("body").append("div")
        .attr("class", "gantt-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "8px")
        .style("background", "rgba(0,0,0,0.7)")
        .style("color", "#fff")
        .style("border-radius", "4px")
        .style("font-size", "12px");

    const bars = chart.selectAll(".bar-group")
      .data(parsedTasks)
      .enter().append("g")
      .attr("class", "bar-group")
      .attr("transform", d => `translate(0, ${yScale(d.name) || 0})`);
      
    // Task background bar
    bars.append("rect")
      .attr("class", "bar-bg")
      .attr("x", d => xScale(d.startDate))
      .attr("width", d => xScale(d.endDate) - xScale(d.startDate))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#93c5fd"); // blue-300

    // Task progress bar
    bars.append("rect")
      .attr("class", "bar-progress")
      .attr("x", d => xScale(d.startDate))
      .attr("width", d => (xScale(d.endDate) - xScale(d.startDate)) * (d.progress / 100))
      .attr("height", yScale.bandwidth())
      .attr("fill", "#2563eb"); // blue-600
    
    // Interaction
    bars.on("mouseover", function(event, d) {
        select(this).style("opacity", 0.7);
        tooltip.style("visibility", "visible")
               .html(`
                    <strong>${d.name}</strong><br/>
                    ${t('m4_projectTimeline.table.startDate')}: ${d.startDate.toLocaleDateString()}<br/>
                    ${t('m4_projectTimeline.table.endDate')}: ${d.endDate.toLocaleDateString()}<br/>
                    ${t('m4_projectTimeline.table.progress')}: ${d.progress}%
               `);
    })
    .on("mousemove", function(event) {
        tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
    })
    .on("mouseout", function() {
        select(this).style("opacity", 1);
        tooltip.style("visibility", "hidden");
    });

    return () => {
      tooltip.remove();
    };
  }, [tasks, t, i18n.language]);

  return <svg ref={ref}></svg>;
};
