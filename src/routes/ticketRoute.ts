import { Router } from 'express';
import { createNewTicket,assignUser,getTicketsDetails,getTicketSummaryController,getAnalytics} from '../controllers/ticketController';
import {authenticate} from '../middlewares/authMiddleware'

const router = Router();

router.post('/createNewTicket',authenticate, createNewTicket);
router.post('/:ticketId/assign',authenticate,assignUser)
router.get('/tickets/:ticketId',authenticate,getTicketsDetails)
router.get('/analytics',authenticate,getTicketSummaryController)
router.get('/dashboard/analytics',authenticate,getAnalytics)

export default router;