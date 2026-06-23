(function setupLocalZohoSdk() {
  const handlers = {};

  const emit = (eventName, payload) => {
    (handlers[eventName] || []).forEach((handler) => {
      try {
        handler(payload);
      } catch (error) {
        console.error('[Local Zoho SDK] handler failed', error);
      }
    });
  };

  window.ZOHO = {
    embeddedApp: {
      on(eventName, handler) {
        handlers[eventName] = handlers[eventName] || [];
        handlers[eventName].push(handler);
      },
      init() {
        window.localStorage.setItem('zoho_local_sdk_loaded', 'true');

        window.setTimeout(() => {
          emit('PageLoad', {
            Entity: 'Leads',
            EntityId: ['4876876000000001001'],
            Page: 'LeadReach',
            local: true,
          });
        }, 100);
      },
      _emit: emit,
    },
    CRM: {
      CONFIG: {
        getCurrentUser() {
          return Promise.resolve({
            users: [
              {
                id: '4876876000000001001',
                full_name: 'Local Zoho User',
                email: 'local.user@example.com',
                role: { name: 'Administrator' },
              },
            ],
          });
        },
        getOrgInfo() {
          return Promise.resolve({
            org: [
              {
                company_name: 'Local Zoho CRM',
                primary_email: 'admin@example.com',
                zgid: 'local-zgid',
              },
            ],
          });
        },
      },
    },
  };

  window.dispatchEvent(new Event('zoho-local-sdk-ready'));
})();
