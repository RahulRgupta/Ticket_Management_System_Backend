import pool from '../db/db';

//create ticket
export const createTicket = async (title: string, description: string,type:string,venue:string,status:string,price:number,priority:string,dueDate:Date,createBy:string) => {
    const result = await pool.query(
      'INSERT INTO tickets (title,description,type,venue,status,price,priority,dueDate,createBy) VALUES ($1, $2, $3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [title, description,type,venue,status,price,priority,dueDate,createBy]
    );
    return result.rows[0];
  };

  //getTicketById
  export const getTicketById = async (id: string) => {
    const result = await pool.query('SELECT * FROM tickets WHERE id = $1', [id]);
    return result.rows[0] || null; 
  }

  //getUserById
  export const getUserById = async (id: string) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null; 
  }

  //assignUserToTicket
  export const assignUserToTicket = async (ticketId: string, userId: string) => {
    await pool.query(
      'INSERT INTO ticketUsers (ticketid, userid) VALUES ($1, $2)',
      [ticketId, userId]
    );
  };

  //checkAssignUserId
  export const checkAssignUserId = async (id: string) => {
    const result = await pool.query('SELECT * FROM ticketUsers WHERE userId = $1', [id]);
    return result.rows[0] || null; 
  }

  //getTicketDetails
  export const getTicketDetails = async (ticketId: number) => {
    const ticketResult = await pool.query(
      'SELECT * FROM tickets WHERE id = $1',
      [ticketId]
    );
    // Fetch users assigned to the ticket
    const assignedUsersResult = await pool.query(
      `SELECT u.id AS userId, u.name, u.email
      FROM users u
      JOIN ticketusers tu ON u.id = tu.userid::int
      WHERE tu.ticketid = $1`,
     [ticketId]
    );

    
    if (ticketResult.rows.length === 0) {
      return { message: 'Ticket not found' };
    }
    
     const ticketWithAssignedUsers = {
      ...ticketResult.rows[0], 
      assignedUsers: assignedUsersResult.rows
    };

    return { ticket: ticketWithAssignedUsers };
  };


  //
  interface FilterOptions {
    startDate?: string;
    endDate?: string;
    status?: string;
    priority?: string;
    type?: string;
    venue?: string;
  }
  //getTicketSummary
export const getTicketSummary = async (filters: FilterOptions) => {
  try {
    let whereClauses: string[] = [];
    let values: any[] = [];
    let valueIndex = 1;

    if (filters.startDate) {
      whereClauses.push(`created_date >= $${valueIndex++}`);
      values.push(filters.startDate);
    }
    if (filters.endDate) {
      whereClauses.push(`created_date <= $${valueIndex++}`);
      values.push(filters.endDate);
    }
    if (filters.status) {
      whereClauses.push(`status = $${valueIndex++}`);
      values.push(filters.status);
    }
    if (filters.priority) {
      whereClauses.push(`priority = $${valueIndex++}`);
      values.push(filters.priority);
    }
    if (filters.type) {
      whereClauses.push(`type = $${valueIndex++}`);
      values.push(filters.type);
    }
    if (filters.venue) {
      whereClauses.push(`venue = $${valueIndex++}`);
      values.push(filters.venue);
    }

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';


    // Total number of tickets
    const totalTicketsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM tickets'
    );
    const totalTickets = parseInt(totalTicketsResult.rows[0].count, 10);

    // Number of closed tickets
    const closedTicketsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM tickets WHERE status = $1',
      ['closed']
    );
    const closedTickets = parseInt(closedTicketsResult.rows[0].count, 10);

    // Number of open tickets
    const openTicketsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM tickets WHERE status = $1',
      ['open']
    );
    const openTickets = parseInt(openTicketsResult.rows[0].count, 10);

    // Number of in-progress tickets
    const inProgressTicketsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM tickets WHERE status = $1',
      ['in-progress']
    );
    const inProgressTickets = parseInt(inProgressTicketsResult.rows[0].count, 10);

    // Distribution of tickets by priority
    const priorityDistributionResult = await pool.query(
      'SELECT priority, COUNT(*) AS count FROM tickets GROUP BY priority'
    );
    const priorityDistribution = priorityDistributionResult.rows.reduce((acc: any, row: any) => {
      acc[row.priority] = parseInt(row.count, 10);
      return acc;
    }, {});

    // Distribution of tickets by type
    const typeDistributionResult = await pool.query(
      'SELECT type, COUNT(*) AS count FROM tickets GROUP BY type'
    );
    const typeDistribution = typeDistributionResult.rows.reduce((acc: any, row: any) => {
      acc[row.type] = parseInt(row.count, 10);
      return acc;
    }, {});
    // Fetch the tickets array
    const ticketsResult = await pool.query(
      `SELECT id, title, status, priority, type, venue,createby, createdat FROM tickets ${whereClause}`,values
    );
    const tickets = ticketsResult.rows.map(row => ({
      id: row.id,
      title: row.title,
      status: row.status,
      priority: row.priority,
      type: row.type,
      venue: row.venue,
      createdDate: row.createdat,
      createdBy: row.createby
    }));

    return {
      totalTickets,
      closedTickets,
      openTickets,
      inProgressTickets,
      priorityDistribution,
      typeDistribution,
      tickets
    };
  } catch (error) {
    console.error('Error fetching ticket summary:', error);
    throw new Error('Database error');
  }
};


//getTicketAnalytics
export const getTicketAnalytics = async () => {
  try {
    // Total number of tickets
    const totalTicketsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM tickets'
    );
    const totalTickets = parseInt(totalTicketsResult.rows[0].count, 10);

    // Closed tickets
    const closedTicketsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM tickets WHERE status = $1',
      ['closed']
    );
    const closedTickets = parseInt(closedTicketsResult.rows[0].count, 10);

    // Open tickets
    const openTicketsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM tickets WHERE status = $1',
      ['open']
    );
    const openTickets = parseInt(openTicketsResult.rows[0].count, 10);

    // In-progress tickets
    const inProgressTicketsResult = await pool.query(
      'SELECT COUNT(*) AS count FROM tickets WHERE status = $1',
      ['in-progress']
    );
    const inProgressTickets = parseInt(inProgressTicketsResult.rows[0].count, 10);

    // Priority distribution
    const priorityDistributionResult = await pool.query(
      'SELECT priority, COUNT(*) AS count FROM tickets GROUP BY priority'
    );
    const priorityDistribution = priorityDistributionResult.rows.reduce((acc: any, row: any) => {
      acc[row.priority] = parseInt(row.count, 10);
      return acc;
    }, {});

    // Type distribution
    const typeDistributionResult = await pool.query(
      'SELECT type, COUNT(*) AS count FROM tickets GROUP BY type'
    );
    const typeDistribution = typeDistributionResult.rows.reduce((acc: any, row: any) => {
      acc[row.type] = parseInt(row.count, 10);
      return acc;
    }, {});

    // // Average customer spending
    // // Assuming there's a table `customer_spending` with fields `customer_id` and `amount`
    // const averageCustomerSpendingResult = await pool.query(
    //   'SELECT AVG(amount) AS average FROM customer_spending'
    // );
    // const averageCustomerSpending = parseFloat(averageCustomerSpendingResult.rows[0].average) || 0;

    // Average tickets booked per day
    const ticketsBookedPerDayResult = await pool.query(
      'SELECT COUNT(*) AS count FROM tickets WHERE createdat >= NOW() - INTERVAL \'1 MONTH\''
    );
    const ticketsBookedPerDay = Math.ceil(parseInt(ticketsBookedPerDayResult.rows[0].count, 10) / 30); // Approximate days in a month

    // Average tickets booked per day per priority level
    const averageTicketsBookedPerPriorityResult = await pool.query(
      `SELECT priority, COUNT(*)::FLOAT / 30 AS averageBookedPerDay
       FROM tickets
       WHERE createdat >= NOW() - INTERVAL '1 MONTH'
       GROUP BY priority`
    );
    const averageTicketsBookedPerPriority = (await averageTicketsBookedPerPriorityResult.rows.reduce((acc: any, row: any) => {
      acc[row.priority] = parseFloat(row.averageBookedPerDay);
      return acc;
    }, {}));

    return {
      totalTickets,
      closedTickets,
      openTickets,
      AverageTicketsBookedPerDay: ticketsBookedPerDay,
      inProgressTickets,
      priorityDistribution,
      typeDistribution,
      // averageCustomerSpending,
      ...averageTicketsBookedPerPriority
    };
  } catch (error) {
    console.error('Error fetching ticket analytics:', error);
    throw new Error('Database error');
  }
};

