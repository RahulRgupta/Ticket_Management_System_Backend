import { Request, Response } from 'express';
import { createTicket,getTicketById,getUserById,assignUserToTicket,checkAssignUserId,getTicketDetails,getTicketSummary,getTicketAnalytics} from '../models/ticketModel'; // Import the service function
import {VALID_PRIORITY_TYPES,VALID_TICKET_STATUSES,VALID_TICKET_TYPES} from '../constants/constant'

//createNewTicket
export const createNewTicket = async (req: Request, res: Response) => {
  const { title, description, type, venue, status, price, priority, dueDate } = req.body;
  const createBy = (req as any).userId;
  // Validate type and status against constants
   if (!VALID_TICKET_TYPES.includes(type)) {
    return res.status(400).json({ message: 'Invalid type' });
  }
  if (!VALID_TICKET_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  if (!VALID_PRIORITY_TYPES.includes(priority)) {
    return res.status(400).json({ message: 'Invalid priority' });
  }
  try {
    const ticket = await createTicket(title, description, type, venue, status, price, priority, dueDate, createBy);
    res.status(201).json({ ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


//
const MAX_USERS_PER_TICKET = 5;

//assignUser
export const assignUser = async (req: Request, res: Response) => {
 const {ticketId} = req.params;
 const {userId } = req.body;
  const requestUserId = (req as any).userId; // The ID of the user making the request
  const userType = (req as any).type
console.log(userType)
  try {

    // Get the ticket details
    const ticket = await getTicketById(ticketId);
    const createBy=ticket.createby
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    // Check if the requester is authorized (either the ticket creator or an admin)
    if (requestUserId !=createBy && userType!= 'admin') {
        return res.status(403).json({ message: 'Unauthorized to assign users to this ticket' });
      }

    // Check if the ticket is closed
    if (ticket.status === 'closed') return res.status(400).json({ message: 'Cannot assign users to a closed ticket' });

    //Check if the user is already assigned
    const isUserAssigned =await checkAssignUserId(userId);
    if (isUserAssigned) return res.status(400).json({ message: 'User already assigned to this ticket' });

    // Validate the userId
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ message: "User does not exist" });

    // Check if the user is an admin
    const userRole = await getUserById(userId);
    if (userRole.type === 'admin') return res.status(400).json({ message: 'Cannot assign ticket to an admin' });

    // Check the total number of assigned users
    const totalAssignedUsers = ticket.length;
    if (totalAssignedUsers >= MAX_USERS_PER_TICKET) return res.status(400).json({ message: "User assignment limit reached" });


    // Assign the user to the ticket
    await assignUserToTicket(ticketId, userId);
    res.status(200).json({ message: 'User assigned successfully' });
  } catch (error) {
    console.error('Error assigning user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


//getTicketsDetails
export const getTicketsDetails = async (req: Request, res: Response) => {
  const ticketId = parseInt(req.params.ticketId, 10);
  try {
    const details = await getTicketDetails(ticketId);
    res.json(details);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Server error' });
  }
};


//getTicketSummaryController
export const getTicketSummaryController = async (req: Request, res: Response) => {
  try {
    const filters = {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      status: req.query.status as string,
      priority: req.query.priority as string,
      type: req.query.type as string,
      venue: req.query.venue as string
    };
    const summary = await getTicketSummary(filters);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

//getAnalytics
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const analytics = await getTicketAnalytics();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
