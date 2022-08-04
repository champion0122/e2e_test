

const errorTryAgain = (fun: Function, maxTime: number) => {
  let executedTime = 0;
  do{
    try{
      fun();
      executedTime = maxTime;
    }catch(e){
      executedTime++;
    }
  }while(executedTime < maxTime);
}

export default errorTryAgain;