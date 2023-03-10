import {Component, ViewEncapsulation, Input} from '@angular/core';

declare let jQuery: any;

@Component({
  selector: 'main-chart',
  templateUrl: './main-chart.template.html',
  encapsulation: ViewEncapsulation.None
})
export class MainChartComponent {
  $chartLegend;
  $chartTooltip;
  $chartContainer;

  @Input() data: any[];

  _isReceiving: boolean = false;
  @Input() set isReceiving(state) {
    const prevState = this._isReceiving;
    this._isReceiving = state;
    if (!state && prevState) {
      this.init();
    }
  }

  get isReceiving() {
    return this._isReceiving;
  }

  onDrawHook() {
    this.$chartLegend
      .find('.legendColorBox > div')
      .css({
        border: 15,
        borderRadius: 0,
        paddingTop: 5,
        display: 'flex',
        justifyContent: 'center',
      })
      .children('div')
      .css({
        borderWidth: 1,
        borderRadius: 0,
        width: 30,
      });

    this.$chartLegend.find('tbody td').css({
      paddingLeft: 10,
      paddingRight: 10,
      textAlign: 'center',
    });

    const labels = this.$chartLegend.find('.legendLabel').detach();
    this.$chartLegend.find('tbody').prepend('<tr></tr>');
    this.$chartLegend.find('tbody tr:eq(0)').append(labels);
  }

  initChart() {
    const data = this.data;

    const ticks = ['Dec 19', 'Dec 25', 'Dec 31', 'Jan 10', 'Jan 14',
      'Jan 20', 'Jan 27', 'Jan 30', 'Feb 2', 'Feb 8', 'Feb 15',
      'Feb 22', 'Feb 28', 'Mar 7', 'Mar 17'];

    // check the screen size and either show tick for every 4th tick on large screens, or
    // every 8th tick on mobiles
    const tickInterval = screen.width < 500 ? 10 : 6; // eslint-disable-line

    return jQuery.plotAnimator(this.$chartContainer, [{
      width: '100%',
      label: 'Light Blue',
      data: data[0],
      lines: {
        show: true,
        fill: 0.3,
        lineWidth: 0,
      },
      points: {
        fillColor: '#A7BEFF',
      },
      shadowSize: 0,
    }, {
      label: 'RNS App',
      data: data[1],
      dashes: {
        show: true,
        lineWidth: 1.5,
        dashLength: [5, 2],
      },
      points: {
        fillColor: '#3abf94',
      },
      shadowSize: 0,
    }, {
      animator: {steps: 100, duration: 30 * 14, start: 0},
      label: 'Sing App',
      data: data[2],
      lines: {
        show: true,
        lineWidth: 1.5,
      },
      points: {
        fillColor: '#f55d5d',
      },
      shadowSize: 0,
    }], {
      xaxis: {
        tickColor: '#f8f9fa',
        tickSize: tickInterval,
        tickFormatter: i => ticks[i / tickInterval],
        font: {
          lineHeight: 11,
          weight: 400,
        },
        color: '#636363'
      },
      yaxis: {
        tickColor: '#f8f9fa',
        max: 5,
        font: {
          lineHeight: 11,
          weight: 400,
        },
        color: '#636363'
      },
      points: {
        show: true,
        fill: true,
        lineWidth: 5,
        radius: 0,
      },
      grid: {
        backgroundColor: {colors: ['#ffffff', '#ffffff']},
        borderWidth: 1,
        borderColor: '#ffffff',
        margin: 0,
        minBorderMargin: 0,
        labelMargin: 20,
        hoverable: true,
        clickable: true,
        mouseActiveRadius: 6,
      },
      legend: {
        noColumns: 3,
        container: $('#main-chart .chart-legend'),
      },
      colors: ['#E2E1FF', '#3abf94', '#ffc247'],
      hooks: {
        draw: [this.onDrawHook.bind(this)],
      },
    });
  }

  initEventListeners() {
    const self = this;

    this.$chartContainer.on('plothover', (event, pos, item) => {
      if (item) {
        const x = item.datapoint[0].toFixed(2);
        const y = item.datapoint[1].toFixed(2);
        self.$chartTooltip.html(`${item.series.label} at ${x} : ${y}`)
          .css({
            top: (item.pageY + 5) - window.scrollY,
            left: (item.pageX + 5) - window.scrollX,
          })
          .fadeIn(200);
      } else {
        self.$chartTooltip.hide();
      }
    });
  }

  init() {
    this.$chartLegend = jQuery('#main-chart  .chart-legend');
    this.$chartTooltip = jQuery('#main-chart  .chart-tooltip');
    this.$chartContainer = jQuery('#main-chart  .chart-container');
    this.initChart();
    this.initEventListeners();
  }
}

