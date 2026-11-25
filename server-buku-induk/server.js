require('dotenv').config();
const express=require('express');
const cors=require('cors');
const morgan=require('morgan');
const path=require('path');
const authRoutes=require('./routes/authRoutes');
const adminRoutes=require('./routes/adminRoutes');
const guruRoutes=require('./routes/guruRoutes');
const studentRoutes=require('./routes/studentRoutes');
const gradeRoutes=require('./routes/gradeRoutes');

/** Membuat aplikasi Express dan memasang router REST API v1. @returns {Object} Aplikasi untuk dijalankan atau diuji. */
function createApp(){const app=express();app.use(cors({origin:process.env.CLIENT_ORIGIN||'http://localhost:5173'}));app.use(express.json({limit:'2mb'}));app.use(morgan('dev'));app.use('/uploads',express.static(path.join(__dirname,'uploads')));app.use('/api/v1',authRoutes,adminRoutes,guruRoutes,studentRoutes,gradeRoutes);app.get('/health',(_req,res)=>res.json({status:'ok'}));app.use((err,_req,res,_next)=>res.status(err.status||(err.name==='MulterError'?400:500)).json({message:err.message||'Terjadi kesalahan server.',detail:process.env.NODE_ENV==='production'?undefined:err.message}));return app;}

if(require.main===module){const app=createApp();const port=Number(process.env.PORT||5000);app.listen(port,()=>console.log(`E-Buku Induk API berjalan di http://localhost:${port}/api/v1`));}
module.exports={createApp};
