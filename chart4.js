
const address = document.querySelector('.address')
const bill = document.querySelector('.bill')
const kwh = document.querySelector('.kwh')
const commercial = document.querySelector('.comm')

//setting the default radio button to commercial
const getDefault = (commercial) => {  
    let defaults 
    if(commercial.checked){
      defaults = .12
    }else{
      defaults = .25
    }
    return defaults
}
 
 //address autocomplete
  google.maps.event.addDomListener(window, "load", function () {
    var places = new google.maps.places.Autocomplete(
    document.querySelector(".address")  
    );     
  });

//validating that last item in address is USA
const validAddress = (address) => {
    var newAdd = address.split(' ')
    var usa = newAdd[newAdd.length -1]
    return usa
}

//setting the elements that will show & disappear after submit
const showHide = () =>{ 
  document.querySelector('.please-wait').style.display = 'none'
   document.querySelector('.main').style.display = 'block'
}

//setting the date
var months =  ['Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec']
var date = new Date()
var year = date.getFullYear()
var month = date.getMonth()
var day = date.getDate()
var dates = months[month]+' '+day+', '+year 

 //calculating the system size & monthly savings
const savings = (month, year) => {
    let monthly_bill = month
    let cost_kwh
    kwh.value ? cost_kwh = year : 
    cost_kwh = getDefault(commercial) 
    let annual_production = (12 * monthly_bill)/ cost_kwh
    let system_size = (annual_production/ 1.46) /1000
    const interest = .07
    const formula = interest/12 * (1 + interest/12) **
     120/((1+ interest/12) ** 120 - 1)
    let costAfterIncentive = system_size * 2000 * .6
    let monthly_finance = costAfterIncentive * formula
    let first_month_saving = monthly_bill - monthly_finance
    let first_year_saving = first_month_saving * 12
    
    document.querySelector('.savings-month').innerText = first_month_saving.toLocaleString("en-US", {style:"currency", currency:"USD"})
    document.querySelector('.savings-year').innerText = first_year_saving.toLocaleString("en-US", {style:"currency", currency:"USD"})
    document.querySelector('.savings-month1').innerText = first_month_saving.toLocaleString("en-US", {style:"currency", currency:"USD"})
    document.querySelector('.savings-year1').innerText = first_year_saving.toLocaleString("en-US", {style:"currency", currency:"USD"})
    document.querySelector('.system-size').innerText = Math.round(system_size).toLocaleString()+' KW'
    document.querySelector('.system-size1').innerText = Math.round(system_size).toLocaleString()+' KW'
    document.querySelector('.addr').innerText = address.value
    document.querySelector('.addr1').innerText = address.value
    document.querySelector('.addr2').innerText = address.value
    document.querySelector('.date').innerText = dates  
    chart1(address.value, system_size)
  
   chart2(Number(bill.value), Number(kwh.value))
   
   document.querySelector('.input').style.display = 'none'
   document.querySelector('.please-wait').style.display = 'block'
   setTimeout(showHide, 3000)
   
}


//populating first graph based on annual production of kwh
const getAcAnnual = (annual_production) =>{
    const percent = [.068, .076, .103, .107, .107, .109, 
      .123, .107, .098, .079, .063, .052]
    document.querySelector('.annual').innerText = Math.round(annual_production).toLocaleString()+' KWh' 
     document.querySelector('.annual1').innerText = Math.round(annual_production).toLocaleString()+' KWh'        
    for (let i = 0; i< 12;i++){
      //myChart.data.datasets[0].data.push(annual_production.outputs.ac_monthly[i]) 
       myChart.data.datasets[0].data.push(annual_production * percent[i])  
   } 
    myChart.update()    
}
 
   //pvwatts api call o receive annual kwh
   const chart1 = (address,systemCapacity)=>{    
    fetch('https://developer.nrel.gov/api/pvwatts/v8.json?api_key=3tqiqGVtlbyrfadqyJK0TuxtDrWKF7eA48yUppK4&azimuth=180&system_capacity='+systemCapacity+'&losses=14&array_type=1&module_type=0&gcr=0.4&dc_ac_ratio=1.2&inv_eff=96.0&radius=0&dataset=nsrdb&tilt=10&address='+address+'&soiling=12|4|45|23|9|99|67|12.54|54|9|0|7.6&albedo=0.3&bifaciality=0.7'
    ).then((response)=> response.json())
        .then((data) =>  getAcAnnual(data.outputs.ac_annual))
    
  }  

//populating second graph with contrast between solar & utility, populating third graph with cumulative savings
const chart2 = (month, kwho) =>{
    let monthly_bill = month
    let year_bill = monthly_bill * 12 
    let cost_kwh  
    kwh.value ? cost_kwh =  kwho: 
    cost_kwh = getDefault(commercial) 
    let annual_production = (12 * monthly_bill)/ cost_kwh
    let system_size = (annual_production/ 1.46) /1000
    const interest = .07
    const formula = interest/12 * (1 + interest/12) **
     120/((1+ interest/12) ** 120 - 1)
    let costAfterIncentive = system_size * 2000 * .6
    let monthly_finance = costAfterIncentive * formula

    for (let i =0; i<20; i++){
      if (i < 10){
       myChart2.data.datasets[0].data.push(monthly_finance * 12)
      }else{
        myChart2.data.datasets[0].data.push(0)
      }
    }

     for (let i =0; i<20; i++){
        if(i > 0 ){
          myChart2.data.datasets[1].data.push(myChart2.data.datasets[1].data[i-1] + (myChart2.data.datasets[1].data[i-1] * .025))
       
       }else{
          myChart2.data.datasets[1].data.push(year_bill)
     }
    }
            myChart2.update()
          for (let i = 0; i < 20; i++){
             if(i == 0) {
                 myChart3.data.datasets[0].data.push(myChart2.data.datasets[1].data[i] - myChart2.data.datasets[0].data[i])
             } else if(i > 0 && i < 10){
                 myChart3.data.datasets[0].data.push(myChart2.data.datasets[1].data[i] - myChart2.data.datasets[0].data[i] +  myChart3.data.datasets[0].data[i-1])
             }else{
                myChart3.data.datasets[0].data.push(myChart2.data.datasets[1].data[i] + myChart3.data.datasets[0].data[i-1])
             }
          } 
          myChart3.update()
  }  

//submit onclick function  
const getSavings = () =>{
  if(!bill.value || isNaN(bill.value) || (isNaN(kwh.value) && kwh.value)||
        bill.value <= 0 || (kwh.value && kwh.value<=0) ){
        alert('enter correct information')

      }else if(validAddress(document.querySelector('.address').value)!== 'USA'){
         alert('Please select USA address from autocomplete')
         reset()
      }else{
 savings(Number(bill.value), Number(kwh.value))
  }
}

//reset onclick function
const reset = () =>{
    location.reload()
}

//3 canvas graphs below

Chart.defaults.font.weight = 'bold'

const ctx = document.getElementById('chart').getContext('2d');
  
  const bgColor = {
      id:'bgColor',
      beforeDraw: (chart,options) =>{
        const {ctx, width, height} = chart
        ctx.fillStyle = 'white'
        ctx.fillRect(0,0,width,height)
        ctx.restore()
      }
   }
  
  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'] ,

      
      datasets: [{
        label: 'solar',
        data: [],
        borderWidth: 1,
        backgroundColor: '#ff5900'
      }]

    },

    options: {
      scales: {
         y: {
          beginAtZero: true,
          title:{
            display : true,
            text: 'KWH  THOUSANDS'
          }
        }
       
        
      }
    },
     plugins: [bgColor]
  });

//graph 2
const ctx2 = document.getElementById('chart2').getContext('2d');
    
    let xlabels2 = []
     
  for (let i =0; i< 20;i++){
    xlabels2.push(`year ${i+1}`)
  }
   const bgColor2 = {
      id:'bgColor2',
      beforeDraw: (chart,options) =>{
        const {ctx, width, height} = chart
        ctx.fillStyle = 'white'
        ctx.fillRect(0,0,width,height)
        ctx.restore()
      }
   }
  
  const myChart2 = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels:xlabels2,
      
      datasets: [{
        label: 'Monthly cost with solar financing',
        data: [],
        borderWidth: 1,
        backgroundColor: '#ff5900'
      },
      {
        label: 'Grid cost no solar',
        data: [],
        borderWidth: 1,
        backgroundColor: 'blue'
      } ]

    },
   
    options: {
      scales: {
        y: {
          beginAtZero: true,
           title:{
            display : true,
            text: 'GRID  COST  NO  SOLAR'
          },
          ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, ticks) {
                        return '$' + value.toLocaleString();
                    }
                }   
        }
      }
    },
    plugins: [bgColor2]
  });
   
   //graph 3
   const ctx3 = document.getElementById('chart3').getContext('2d');

    let xlabels3 = []
     
  for (let i =0; i< 20;i++){
    xlabels3.push(`year ${i+1}`)
  }

  const bgColor3 = {
      id:'bgColor3',
      beforeDraw: (chart,options) =>{
        const {ctx, width, height} = chart
        ctx.fillStyle = 'white'
        ctx.fillRect(0,0,width,height)
        ctx.restore()
      }
   }

  const myChart3 = new Chart(ctx3, {
    type: 'bar',
    data: {
      labels: xlabels3,
      datasets: [{
        label: 'solar',
        data: [],
        borderWidth: 1,
        backgroundColor: '#ff5900'
      }]
    },

    options: {
      scales: {
        y: {
          beginAtZero: true,
          title:{
            display : true,
            text: 'CUMULATIVE  SAVINGS'
          },
           ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, ticks) {
                        return '$' + value.toLocaleString();
                    }
                }      
        }

      }
    },
     plugins: [bgColor3]
  });

//logo image data for pdf
var imgData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAeAB4AAD/4RDKRXhpZgAATU0AKgAAAAgABAE7AAIAAAACTQAAAIdpAAQAAAABAAAISpydAAEAAAAETQAAAOocAAcAAAgMAAAAPgAAAAAc6gAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFkAMAAgAAABQAABCYkAQAAgAAABQAABCskpEAAgAAAAM1NgAAkpIAAgAAAAM1NgAA6hwABwAACAwAAAiMAAAAABzqAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAyMzowMzoxNSAyMTowNjoxNQAyMDIzOjAzOjE1IDIxOjA2OjE1AAAA/+ELFGh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4NCjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iPjxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+PHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9InV1aWQ6ZmFmNWJkZDUtYmEzZC0xMWRhLWFkMzEtZDMzZDc1MTgyZjFiIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iLz48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyI+PHhtcDpDcmVhdGVEYXRlPjIwMjMtMDMtMTVUMjE6MDY6MTUuNTU2PC94bXA6Q3JlYXRlRGF0ZT48L3JkZjpEZXNjcmlwdGlvbj48cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0idXVpZDpmYWY1YmRkNS1iYTNkLTExZGEtYWQzMS1kMzNkNzUxODJmMWIiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+PGRjOmNyZWF0b3I+PHJkZjpTZXEgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj48cmRmOmxpPk08L3JkZjpsaT48L3JkZjpTZXE+DQoJCQk8L2RjOmNyZWF0b3I+PC9yZGY6RGVzY3JpcHRpb24+PC9yZGY6UkRGPjwveDp4bXBtZXRhPg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8P3hwYWNrZXQgZW5kPSd3Jz8+/9sAQwAHBQUGBQQHBgUGCAcHCAoRCwoJCQoVDxAMERgVGhkYFRgXGx4n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'

   //pdf front page design drawn on html canvas
   const a = document.querySelector('.design')
    const ctx5=a.getContext('2d')
    ctx5.beginPath()
    ctx5.moveTo(0,20)
    ctx5.lineTo(400,50)
    ctx5.lineTo(400,70)
    ctx5.lineTo(0,40)
    ctx5.stroke()
    ctx5.fill()
    ctx5.beginPath()
    ctx5.fillStyle = '#ff5900'
    ctx5.moveTo(0,40)
    ctx5.lineTo(400,70)
    ctx5.lineTo(400,100)
    ctx5.lineTo(0,100)
    ctx5.stroke()
    ctx5.fill()
    
    ctx5.beginPath()
    ctx5.fillStyle = 'white'
    ctx5.moveTo(0,0)
    ctx5.lineTo(400,0)
    ctx5.lineTo(400,50)
    ctx5.lineTo(0,20)
    ctx5.stroke()
    ctx5.fill()

//pdf setup below

 var specialElementHandlers = {
      '#editor':function(element, renderer){
        return true
      }
    }

function download(){
    const canvas = document.getElementById('chart')
    const canvasImg = canvas.toDataURL('image/jpeg', 1.0)
    const canvas2 = document.getElementById('chart2')
    const canvasImg2 = canvas2.toDataURL('image/jpeg', 1.0)
    const canvas3 = document.getElementById('chart3')
    const canvasImg3 = canvas3.toDataURL('image/jpeg', 1.0)
    const canvas4 = document.querySelector('.design')
    const canvasImg4 = canvas4.toDataURL('image/jpeg', 1.0)
    
    let pdf = new jsPDF('p')
    
    pdf.addImage(imgData, 'JPEG', 20,18,33,23)
    pdf.setFontSize(5)
    pdf.text('Your energy source', 28, 43)
    pdf.fromHTML(document.querySelector('.huge-header'), 20, 115,{
      'width':170,
      'elementHandlers':specialElementHandlers
    })
    pdf.addImage(canvasImg4, 'JPEG', 0,265, 225, 33)
    pdf.addPage()
    pdf.fromHTML(document.querySelector('.pdf'), 20,20,{
      'width':170,
      'elementHandlers':specialElementHandlers
    })
    pdf.setFillColor(255, 89, 0)
    pdf.rect(0,294,225,4,'F')
    pdf.addPage()
     pdf.fromHTML(document.querySelector('.pdf1'),10,10)
    pdf.addImage(canvasImg, 'JPEG',100, 60, 100, 95)
    pdf.setFillColor(255, 89, 0)
    pdf.rect(0,294,225,4,'F')
    pdf.addPage()
    pdf.setFontSize(18)
    pdf.text(10, 20,'Grid cost no solar vs. Monthly Cost with Solar with Financing')
    pdf.addImage(canvasImg2, 'JPEG', 10, 35, 165, 110)
    pdf.text(10,160,'Cumulative Savings Over 20 Years')
    pdf.addImage(canvasImg3, 'JPEG', 10, 170, 165, 110)
    pdf.setFillColor(255, 89, 0)
    pdf.rect(0,294,225,4,'F')
    pdf.save('solar.pdf')
}



