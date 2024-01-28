const httpToS = (req, res, next) =>{
  if(!req.secure())
  next()
}

export default httpToS
