//import ApexCharts from 'apexcharts'
$(document).ready(function() {
    // Initialize the DataTable
    var table = $('#ducks-table').DataTable({ 
	    "dom": 't',
	    "order": [[ 1, "desc" ]],
            "processing": true,
	    "language": {
              "loadingRecords": '<div class="dt-empty">Loading data, please wait...</div>',
              "processing": '<div class="dt-empty">Processing...</div>',
	    },
	    ajax: {
               url: '/dashboard/json', 
	       dataSrc: 'data',
            },
	    columns: [
              { data: "duck_id", defaultContent: '', className: 'relative border-t border-transparent py-4 pl-4 pr-3 text-sm sm:pl-6', "render": function(data, type, row, meta) {
                    return '<div class="font-medium text-white">' + data + '</div><div class="absolute -top-px left-6 right-0 h-px bg-white/10"></div>';
                }
	      },
	      { data: "created_at", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1'},
	      { data: "topic", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	      { data: "message_id", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	      { data: "path", defaultContent: "", className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	      { data: "payload", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	      { data: "hops", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	      { data: "duck_type", defaultContent: '', className: 'hidden border-t border-white/10 px-3 py-3.5 text-sm text-gray-400 lg:table-cell dt-type-date sorting_1' },
	    ],
    })

  $('#custom-filter').on('keydown', function() {
    table.ajax.reload();
  });

  // Link the custom input to the DataTables search functionality
  $('#custom-filter').on('keyup', function() {
      table.search(this.value).draw();
  });

  // rows drop down
  $('#table-select').val(table.page.len());
  // 3. Add a change event listener to your custom dropdown
  $('#table-select').on('change', function() {
      // Get the selected value
     var selectedValue = $(this).val();

     // Use the DataTables API to change the page length and redraw the table
        table
            .page.len(selectedValue)
            .draw();
  });

  console.log("pulldata loads...");
  function pollData() {
    $.ajax({
      url: '/dashboard/timeline', // Server script to fetch data
      method: 'GET',
      dataType: 'json', // Expecting JSON data from the server
      success: function(data) {
	  // Clear the table body to refresh with all data, or just append new rows
	  console.log('timeline is processing...');

	  // Iterate over the received data and append rows to the table
	  const date = new Date(data.data.created_at);
	  const time24h = date.toLocaleTimeString('en-GB', { 
	    hourCycle: 'h23', 
	    hour: '2-digit', 
            minute: '2-digit',
	    second: '2-digit'
  	  }); 

	  let template = '<li><div class="relative pb-8"><div class="relative flex space-x-3"><div><img src="/images/logo.png" alt="Logo" class="size-10"></div><div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5"><div><p class="text-sm text-gray-400">' + data.data.payload + '<a href="#" class="font-medium text-white"> ' + data.data.duck_id + ' [' + data.data.message_id + '] </a></p></div><div class="whitespace-nowrap text-right text-sm text-gray-400"><time datetime="2020-09-22">' + time24h + '</time></div></div></div></div></li>';

          let oldFeed = localStorage.getItem('feed');
	  if (oldFeed == null) {
            oldFeed = data;
	  } else {
	    oldFeed = JSON.parse(oldFeed);
	  }

	  console.log("old message: ", oldFeed.message_id);
	  console.log("new message: ", data.data.message_id);

	  if (oldFeed.message_id != data.data.message_id) {
            $('div.flow-root ul').prepend(template);
          }

          if ($('div.flow-root ul li').length >= 5) {
            $('div.flow-root ul li').last().remove();
          }

          let feed = JSON.stringify(data.data);
          localStorage.setItem('feed', feed);

	  $('div dd#total-messages').html(data.totalCount);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.error("Error fetching data: " + textStatus, errorThrown);
        }
      })
    }

    // Poll every 3000 milliseconds (3 seconds)
    setInterval(pollData, 5000);

    // Initial call to load data when the page loads
    pollData();
});
