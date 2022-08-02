

const errorTryAgain = (fun: Function) => {
  try{
    fun();
  }catch(e){
    console.error(e)
    fun()
  }
}

export default errorTryAgain;