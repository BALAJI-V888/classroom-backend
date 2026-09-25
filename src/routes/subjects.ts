import express from "express";
import {and, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {departments, subjects} from "../db/schema";
import { db } from '../db'


//defining express router
const router  = express.Router();

//Get all subjects with optional search, filtering and pagination
router.get("/", async (req, res) => {
    try{
        const {search, department, page = 1, limit = 10} = req.query;

        const currentPage = Math.max(1, +page);
        const limitPerPage = Math.max(1, +limit);

        const offset = (currentPage - 1) * limitPerPage;

        const filterCondition = [];

        //If search query exists, then filter it by subject name OR subject code
        if(search){
            filterCondition.push(
                or(
                    ilike(subjects.name,  `%${search}%` ),
                    ilike(subjects.code, `%${search}%` )
                )
            )
        }

        //If department filter exists, match department name
        if(department){
            filterCondition.push(
                ilike(departments.name, `%${department}%`)
            )
        }

        const whereClause = filterCondition.length > 0 ? and(...filterCondition) : undefined;

        //Left joining the subjects and respective department
        const countResult = await db
            .select({
                count : sql<number>`count(*)`
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)

        const totalCount = countResult[0]?.count ?? 0;

        const subjectList = await db
            .select({
                ...getTableColumns(subjects),
                departments : {
                    ...getTableColumns(departments),
                },
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.created_at))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data : subjectList,
            pagination : {
                page : currentPage,
                limit : limitPerPage,
                total : totalCount,
                totalPages : Math.ceil(totalCount / limitPerPage),
            }
        })

    }catch(err){
        console.log(`GET /subjects error : ${err}`)
        res.status(500).json({
            error : 'Failed to get subjects'
        })
    }
})

export default router;



