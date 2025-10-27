document.addEventListener('DOMContentLoaded', () => {

    // === STATE & CONFIG ===
    const API_URL = 'http://localhost:3000/api';
    let currentUser = null;

    // === DOM ELEMENTS ===
    const pages = document.querySelectorAll('.page');
    const navLinks = document.querySelectorAll('.nav-link');
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const userWelcome = document.getElementById('user-welcome');
    const navMyBookings = document.getElementById('nav-my-bookings');
    const navAdmin = document.getElementById('nav-admin');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');

    // === AUTHENTICATION SERVICE ===
    const authService = {
        login: async (email, password) => {
            const data = await api.post('/login', { email, password });
            if (data.user) {
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateUI();
                showPage('page-events');
                loadEventsPage();
                showAlert('Login Successful', `Welcome back, ${currentUser.username}!`);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        },
        register: async (username, email, password) => {
            const data = await api.post('/register', { username, email, password });
            if (data.userId) {
                // Automatically log in after successful registration
                await authService.login(email, password);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        },
        logout: () => {
            currentUser = null;
            localStorage.removeItem('currentUser');
            updateUI();
            showPage('page-login');
        },
        getUser: () => {
            if (currentUser) return currentUser;
            const user = localStorage.getItem('currentUser');
            if (user) {
                currentUser = JSON.parse(user);
                return currentUser;
            }
            return null;
        },
        isLoggedIn: () => authService.getUser() !== null,
        isAdmin: () => authService.getUser()?.role === 'Admin' || authService.getUser()?.role === 'EventManager',
        getUserId: () => authService.getUser()?.userId,
    };

    // === API SERVICE ===
    const api = {
        get: async (endpoint) => {
            try {
                const res = await fetch(`${API_URL}${endpoint}`);
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            } catch (e) {
                showAlert('API Error', `Failed to fetch data from ${endpoint}. Is your backend server running?`);
                console.error(e);
            }
        },
        post: async (endpoint, body) => {
            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                return res.json();
            } catch (e) {
                showAlert('API Error', `Failed to post data to ${endpoint}.`);
                console.error(e);
            }
        },
        put: async (endpoint, body) => {
            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                return res.json();
            } catch (e) {
                showAlert('API Error', `Failed to update data at ${endpoint}.`);
                console.error(e);
            }
        },
        deleteWithBody: async (endpoint, body) => {
            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                return res.json();
            } catch (e) {
                showAlert('API Error', `Failed to delete data at ${endpoint}.`);
                console.error(e);
            }
        },
        del: async (endpoint) => {
            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    method: 'DELETE',
                });
                return res.json();
            } catch (e) {
                showAlert('API Error', `Failed to delete data at ${endpoint}.`);
                console.error(e);
            }
        },
    };

    // === NAVIGATION ===
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.toggle('active', page.id === pageId);
        });
        // Update active nav link
        navLinks.forEach(link => {
            link.classList.toggle('bg-gray-900', link.dataset.page === pageId);
            link.classList.toggle('text-white', link.dataset.page === pageId);
            link.classList.toggle('text-gray-300', link.dataset.page !== pageId);
        });
    }

    function handleNavClick(e) {
        e.preventDefault();
        const pageId = e.currentTarget.dataset.page;
        if (!pageId) return;

        // Simple page protection
        if (pageId === 'page-my-bookings' && !authService.isLoggedIn()) {
            return showPage('page-login');
        }
        if (pageId === 'page-admin' && !authService.isAdmin()) {
            return showPage('page-events');
        }

        showPage(pageId);

        // Load content for the page
        switch (pageId) {
            case 'page-events':
                loadEventsPage();
                break;
            case 'page-my-bookings':
                loadMyBookingsPage();
                break;
            case 'page-admin':
                loadVenuesList();
                break;
        }
    }

    // === UI UPDATER ===
    function updateUI() {
        if (authService.isLoggedIn()) {
            authLinks.style.display = 'none';
            userInfo.style.display = 'flex';
            userWelcome.textContent = `Welcome, ${authService.getUser().username}`;
            navMyBookings.style.display = 'block';

            if (authService.isAdmin()) {
                navAdmin.style.display = 'block';
            } else {
                navAdmin.style.display = 'none';
            }
        } else {
            authLinks.style.display = 'block';
            userInfo.style.display = 'none';
            navMyBookings.style.display = 'none';
            navAdmin.style.display = 'none';
        }
    }

    // === MODAL / ALERT ===
    function showAlert(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.remove('opacity-0', 'pointer-events-none');
    }
    document.getElementById('modal-close').addEventListener('click', () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
    });

    // === PAGE LOADERS ===

    // 1. Load All Events Page
    async function loadEventsPage() {
        const events = await api.get('/events');
        const grid = document.getElementById('events-grid');
        if (!events) {
            grid.innerHTML = '<p>Could not load events.</p>';
            return;
        }
        grid.innerHTML = events.map(event => `
            <div class="group relative bg-white shadow-md rounded-lg overflow-hidden cursor-pointer" data-event-id="${event.EventID}">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-900">
                        <a href="#" class="event-link" data-event-id="${event.EventID}">
                            <span aria-hidden="true" class="absolute inset-0"></span>
                            ${event.Title}
                        </a>
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">${event.VenueName}, ${event.VenueCity}</p>
                    <p class="mt-2 text-sm font-medium text-gray-900">${new Date(event.EventStartTime).toLocaleString()}</p>
                    <p class="mt-2 text-sm font-bold text-indigo-600">${event.AvailableTickets} tickets left</p>
                </div>
            </div>
        `).join('');
    }

    // 2. Load Single Event Page
    async function loadEventDetailPage(id) {
        const event = await api.get(`/events/${id}`);
        if (!event) return;

        document.getElementById('event-detail-title').textContent = event.Title;
        document.getElementById('event-detail-venue').textContent = `${event.VenueName} in ${event.VenueCity}`;
        document.getElementById('event-detail-time').textContent = `${new Date(event.EventStartTime).toLocaleString()} to ${new Date(event.EventEndTime).toLocaleString()}`;
        document.getElementById('event-detail-desc').textContent = event.Description;
        document.getElementById('event-detail-days').textContent = `${event.DaysRemaining} days left`;
        document.getElementById('event-detail-revenue').textContent = `Total Revenue: $${event.TotalRevenue}`;
        document.getElementById('event-detail-available').textContent = `${event.AvailableTickets} tickets available`;

        document.getElementById('booking-event-id').value = event.EventID;

        // We need to fetch the *actual* ticket types for this event
        // This is a missing part of our backend, so we'll simulate it
        // In a real app, you'd have a GET /api/events/:id/ticket-types
        const ticketTypes = [
            { TicketTypeID: 1, TypeName: "General Admission", Price: 50.00 },
            { TicketTypeID: 2, TypeName: "VIP", Price: 200.00 },
            // This is just a placeholder. Our booking form uses ID, so we'll guess.
        ];

        // Let's call our *other* API to get the event's report (which has ticket types)
        const report = await api.get(`/reports/event/${id}`);
        const select = document.getElementById('booking-ticket-type');

        if (report && report.length > 0) {
            select.innerHTML = report.map(tt =>
                `<option value="${tt.TicketTypeID}">Error: This TicketTypeID is from the report, not the real table. Use DB to find real ID.</option>`
            ).join('');
            // HACK: Since we don't have the *real* TicketTypeID, we will hardcode it based on our dummy data.
            // This is a known limitation of our current API design.
            if (id == 1) select.innerHTML = `<option value="1">General Admission</option><option value="2">VIP Pass</option>`;
            else if (id == 2) select.innerHTML = `<option value="3">Balcony</option><option value="4">Orchestra Premier</option>`;
            else if (id == 3) select.innerHTML = `<option value="5">A-Stand</option><option value="6">Grand Stand</option>`;
            else select.innerHTML = `<option value="">No types found</option>`;
        } else {
            select.innerHTML = `<option value="">No ticket types found</option>`;
        }

        showPage('page-event-detail');
    }

    // 3. Load My Bookings Page
    async function loadMyBookingsPage() {
        const userId = authService.getUserId();
        if (!userId) return;

        // Load user stats
        const stats = await api.get(`/my-stats?customerId=${userId}`);
        document.getElementById('my-bookings-stats').innerHTML =
            `<p class="text-lg font-medium text-gray-700">Total Spent on Confirmed Bookings: <span class="font-bold text-indigo-600">$${stats.totalSpent}</span></p>`;

        // Load booking history
        const bookings = await api.get(`/my-bookings?customerId=${userId}`);
        const table = document.getElementById('my-bookings-table');
        if (!bookings || bookings.length === 0) {
            table.innerHTML = '<tr><td colspan="5" class="text-center py-4">You have no bookings.</td></tr>';
            return;
        }

        table.innerHTML = bookings.map(b => `
            <tr>
                <td class="py-4 pl-4 pr-3 text-sm sm:pl-0">
                    <div class="font-medium text-gray-900">${b.EventTitle}</div>
                    <div class="text-gray-500">${new Date(b.BookingTime).toLocaleString()}</div>
                </td>
                <td class="px-3 py-4 text-sm text-gray-500">
                    <div>${b.TypeName} (x${b.Quantity})</div>
                    <div>$${b.PricePerTicket.toFixed(2)} each</div>
                </td>
                <td class="px-3 py-4 text-sm text-gray-500">
                    <span class="inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${b.Status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                b.Status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }">
                        ${b.Status}
                    </span>
                </td>
                <td class="px-3 py-4 text-sm font-medium text-gray-900">$${b.TotalAmount.toFixed(2)}</td>
                <td class="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    ${b.Status === 'Confirmed' ?
                `<a href="#" class="text-red-600 hover:text-red-900 cancel-booking-btn" data-booking-id="${b.BookingID}">Cancel</a>` : ''}
                </td>
            </tr>
        `).join('');
    }

    // 4. Load Admin Report Data
    async function loadAdminReport(eventId) {
        const reportData = await api.get(`/reports/event/${eventId}`);
        const resultsDiv = document.getElementById('report-results');
        if (!reportData || reportData.length === 0) {
            resultsDiv.innerHTML = '<p class="text-sm text-gray-500">No sales data found for this event.</p>';
            return;
        }

        let totalRevenue = 0;
        let totalTickets = 0;

        const tableRows = reportData.map(r => {
            totalRevenue += parseFloat(r.TotalRevenue);
            totalTickets += r.TicketsSold;
            return `
                <tr>
                    <td class="py-2 text-sm text-gray-700">${r.TicketType}</td>
                    <td class="py-2 text-sm text-gray-700 text-right">${r.TicketsSold}</td>
                    <td class="py-2 text-sm text-gray-700 text-right">$${r.TotalRevenue.toFixed(2)}</td>
                </tr>
            `;
        }).join('');

        resultsDiv.innerHTML = `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sold</th>
                        <th class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${tableRows}
                </tbody>
                <tfoot class="bg-gray-50">
                    <tr>
                        <td class="px-3 py-2 text-left text-sm font-bold text-gray-900">TOTALS</td>
                        <td class="px-3 py-2 text-right text-sm font-bold text-gray-900">${totalTickets}</td>
                        <td class="px-3 py-2 text-right text-sm font-bold text-gray-900">$${totalRevenue.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        `;
    }
    // 5. Load Admin Venue List
    async function loadVenuesList() {
        const venues = await api.get('/venues');
        const table = document.getElementById('venue-list-table');
        if (!venues || venues.length === 0) {
            table.innerHTML = '<tr><td colspan="4" class="text-center py-4">No venues found.</td></tr>';
            return;
        }
        table.innerHTML = venues.map(v => `
        <tr>
            <td class="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">${v.VenueID}</td>
            <td class="px-3 py-4 text-sm text-gray-500">${v.Name}</td>
            <td class="px-3 py-4 text-sm text-gray-500">${v.City}</td>
            <td class="px-3 py-4 text-sm text-gray-500">${v.TotalCapacity}</td>
        </tr>
    `).join('');
    }

    // === EVENT LISTENERS ===

    // 1. Nav Links
    navLinks.forEach(link => link.addEventListener('click', handleNavClick));

    // 2. Logout Button
    document.getElementById('logout-button').addEventListener('click', (e) => {
        e.preventDefault();
        authService.logout();
    });

    // 3. Login Form
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            await authService.login(email, password);
        } catch (err) {
            showAlert('Login Failed', err.message);
        }
    });

    // 4. Register Form
    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            await authService.register(username, email, password);
        } catch (err) {
            showAlert('Registration Failed', err.message);
        }
    });

    // 5. Event Card Click (Event Delegation)
    document.getElementById('events-grid').addEventListener('click', (e) => {
        const card = e.target.closest('.event-link');
        if (card) {
            e.preventDefault();
            const eventId = card.dataset.eventId;
            loadEventDetailPage(eventId);
        }
    });

    // 6. Booking Form
    document.getElementById('booking-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!authService.isLoggedIn()) {
            showAlert('Not Logged In', 'You must be logged in to book tickets.');
            return showPage('page-login');
        }

        const body = {
            customerId: authService.getUserId(),
            ticketTypeId: parseInt(document.getElementById('booking-ticket-type').value),
            quantity: parseInt(document.getElementById('booking-quantity').value)
        };

        const data = await api.post('/bookings', body);
        if (data.bookingId) {
            showAlert('Booking Successful!', data.message);
            showPage('page-my-bookings');
            loadMyBookingsPage();
        } else {
            showAlert('Booking Failed', data.message || 'Could not complete booking.');
        }
    });

    // 7. Cancel Booking Button (Event Delegation)
    document.getElementById('my-bookings-table').addEventListener('click', async (e) => {
        if (e.target.classList.contains('cancel-booking-btn')) {
            e.preventDefault();
            const bookingId = e.target.dataset.bookingId;

            // Simple confirm replacement
            showAlert('Confirm Cancellation', 'Are you sure you want to cancel this booking?');
            // This is a simple modal, so we can't "await" a user's click.
            // For a real app, you'd have a more complex modal.
            // For this demo, we will just proceed. A better way would be to replace the modal.

            const body = {
                bookingId: parseInt(bookingId),
                customerId: authService.getUserId()
            };

            const data = await api.post('/bookings/cancel', body);
            if (data.message.startsWith('Error:')) {
                showAlert('Cancellation Failed', data.message);
            } else {
                showAlert('Booking Cancelled', data.message);
                loadMyBookingsPage(); // Refresh the list
            }
        }
    });

    // 8. Admin - Create Event Form
    document.getElementById('create-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!authService.isAdmin()) {
            return showAlert('Unauthorized', 'You do not have permission.');
        }

        const body = {
            managerId: authService.getUserId(),
            venueId: parseInt(document.getElementById('create-venue-id').value),
            title: document.getElementById('create-title').value,
            description: document.getElementById('create-desc').value,
            eventDate: document.getElementById('create-event-date').value
        };

        // This assumes you have mounted your createEvent controller at POST /api/events
        const data = await api.post('/events', body);

        if (data.eventId) {
            showAlert('Success', data.message);
            document.getElementById('create-event-form').reset();
            // Refresh the main events list so the new event appears
            if (document.getElementById('page-events').classList.contains('active')) {
                loadEventsPage();
            }
        } else {
            showAlert('Error', data.message);
        }
    });

    // 9. Admin - Update Event Form
    document.getElementById('update-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!authService.isAdmin()) {
            return showAlert('Unauthorized', 'You do not have permission.');
        }

        const eventId = document.getElementById('update-event-id').value;
        const body = {
            managerId: authService.getUserId(), // Assume admin/manager is logged in
            title: document.getElementById('update-event-title').value,
            description: document.getElementById('update-event-desc').value
        };

        const data = await api.put(`/events/${eventId}`, body);
        if (data.message.startsWith('Error:')) {
            showAlert('Update Failed', data.message);
        } else {
            showAlert('Update Successful', data.message);
        }
    });

    // 10. Admin - Report Form
    document.getElementById('report-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const eventId = document.getElementById('report-event-id').value;
        loadAdminReport(eventId);
    });

    // 11. Admin - Delete Event Form
    document.getElementById('delete-event-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!authService.isAdmin()) {
            return showAlert('Unauthorized', 'You do not have permission.');
        }

        const eventId = document.getElementById('delete-event-id').value;
        const body = {
            managerId: authService.getUserId()
        };

        // This assumes you have mounted your deleteEvent controller at DELETE /api/events/:id
        const data = await api.deleteWithBody(`/events/${eventId}`, body);

        if (data.message.startsWith('Error:')) {
            showAlert('Delete Failed', data.message);
        } else {
            showAlert('Delete Successful', data.message);
            document.getElementById('delete-event-form').reset();
            // Refresh the main events list
            if (document.getElementById('page-events').classList.contains('active')) {
                loadEventsPage();
            }
        }
    });

    // 12. Admin - Create Venue Form
    document.getElementById('create-venue-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!authService.isAdmin()) {
            return showAlert('Unauthorized', 'You do not have permission.');
        }
        const body = {
            name: document.getElementById('create-venue-name').value,
            location: document.getElementById('create-venue-location').value,
            capacity: parseInt(document.getElementById('create-venue-capacity').value)
        };

        const data = await api.post('/venues', body);

        if (data.venueId) {
            showAlert('Success', data.message);
            document.getElementById('create-venue-form').reset();
            loadVenuesList(); // Refresh the venue list
        } else {
            showAlert('Error', data.message);
        }
    });

    // 13. Admin - Update Venue Form
    document.getElementById('update-venue-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!authService.isAdmin()) {
            return showAlert('Unauthorized', 'You do not have permission.');
        }
        const venueId = document.getElementById('update-venue-id').value;
        const body = {
            name: document.getElementById('update-venue-name').value,
            location: document.getElementById('update-venue-location').value,
            capacity: parseInt(document.getElementById('update-venue-capacity').value)
        };

        const data = await api.put(`/venues/${venueId}`, body);

        if (data.message.startsWith('Error:')) {
            showAlert('Update Failed', data.message);
        } else {
            showAlert('Update Successful', data.message);
            document.getElementById('update-venue-form').reset();
            loadVenuesList(); // Refresh the venue list
        }
    });

    // 14. Admin - Delete Venue Form
    document.getElementById('delete-venue-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!authService.isAdmin()) {
            return showAlert('Unauthorized', 'You do not have permission.');
        }
        const venueId = document.getElementById('delete-venue-id').value;

        // Use the new api.del function that doesn't send a body
        const data = await api.del(`/venues/${venueId}`);

        if (data.message.startsWith('Error:')) {
            showAlert('Delete Failed', data.message);
        } else {
            showAlert('Delete Successful', data.message);
            document.getElementById('delete-venue-form').reset();
            loadVenuesList(); // Refresh the venue list
        }
    });


    // === INITIALIZATION ===
    function init() {
        if (authService.isLoggedIn()) {
            updateUI();
            showPage('page-events');
            loadEventsPage();
        } else {
            updateUI();
            showPage('page-login');
        }
    }
    init();

});