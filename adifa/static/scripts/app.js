(function($) {
  $(document).ready(function() {
    // Enable popovers everywhere.
    $('[data-toggle="popover"]').popover();
    // Enable tooltips everywhere.
    $('[data-toggle="tooltip"]').tooltip();
    // Sidebar toggles
    $('.toggle-sidebar').click(function (e) {
      $('.main-sidebar').toggleClass('open');
    });
    // Accordion animations
    $(".obs-values").on('show.bs.collapse', function() {
      $(this).prev(".list-group-item").find(".fa").removeClass("fa-plus-square").addClass("fa-caret-square-up");
      setTimeout(function(el){ explorer.colorize(el); }, 100, this); // Defer to improve UX
    }).on('shown.bs.collapse', function() {
      // $('.main-sidebar .nav-wrapper').animate({
      //     scrollTop: $(this).prev(".list-group-item").position().top - 61
      // }, 500, "swing");
    }).on('hide.bs.collapse', function() {
      $(this).prev(".list-group-item").find(".fa").removeClass("fa-caret-square-up").addClass("fa-plus-square");
    });
    // Init cell atlas explorer
    if ($("#canvas-container").length) {
      var explorer = $("#canvas-container").explorer();
      // Add events
      $(".colourise").on('click', function(event){
        if (explorer) {
          explorer.colorize(this);
          let genes = document.querySelector('#genes');
          genes.deselect(genes.selectedItems[0]);
        }
      });
      $("#genes").on("update", function(event) {
        if (this.selectedItems[0] && this.selectedItems[0] != $("#color-scale-value").text() && explorer) explorer.colorize(this);
      });
      $(document.body).on('click', '.btn-gene-select', function(event){
        if ($(this).text() != $("#color-scale-value").text() && explorer) explorer.colorize(this);
      });      
      $('.obs_value_cb').click(function(event) {
        setTimeout(function(){ explorer.redraw(); }, 100); // Defer to improve UX
      });
      $(".checkall").click(function(event) {
        $('#collapse' + $(this).data('id')).find('input[type=checkbox]').prop('checked', true);
        setTimeout(function(){ explorer.redraw(); }, 100); // Defer to improve UX
      });
      $(".uncheckall").click(function(event) {
        $('#collapse' + $(this).data('id')).find('input[type=checkbox]').prop('checked', false);
        setTimeout(function(){ explorer.redraw(); }, 100); // Defer to improve UX
      });
      $("#color-scale-remove").click(function(event) {
        explorer.removeColor(this) 
      });
      $('body').on('click', '.canvas-obsm-key', function(event) {
        explorer.embedding(this) 
      });
      $("#canvas-zoom-reset").click(function(event) {
        explorer.resetZoom(this) 
      });
      $("#canvas-zoom-plus").click(function(event) {
        explorer.zoomIn(this) 
      });
      $("#canvas-zoom-minus").click(function(event) {
        explorer.zoomOut(this) 
      });      
    } 

    $('.js-data-example-ajax').select2({
      placeholder: "Search for genes",
      closeOnSelect: false,
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
      ajax: {
        url: 'http://127.0.0.1:5000/api/v1/datasets/1/search/genes',
        data: function (params) {
          var query = {
            search: params.term,
            type: 'public'
          }

          // Query parameters will be ?search=[term]&type=public
          return query;
        }
      }
    }).on('select2:select', function (e) {
      var data = e.params.data;
      console.log(data.id);
      $('#search-genes-selected').append(
        $('<button/>')
          .attr("type", "button")
          .attr("id", "'gene-deg-" + data.id)
          .addClass("btn-gene-select btn btn-outline-info btn-sm")
            .text(data.id)
      );
    });

    $('.js-data-disease-ajax').select2({
      placeholder: "Search for diseases",
      sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
      ajax: {
        url: 'http://127.0.0.1:5000/api/v1/datasets/1/search/diseases',
        data: function (params) {
          var query = {
            search: params.term,
            type: 'public'
          }

          // Query parameters will be ?search=[term]&type=public
          return query;
        }
      }
    }).on('select2:select', function (e) {
      var data = e.params.data;
      console.log(data.id);
      var genes = data.id.split(",");
      $.each(genes,function(i){
        $('#search-genes-disease-set').append(
          $('<button/>')
            .attr("type", "button")
            .attr("id", "'gene-deg-" + genes[i])
            .addClass("btn-gene-select btn btn-outline-info btn-sm")
              .text(genes[i])
        );
      });
    });

  });
})(jQuery);
