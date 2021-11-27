$(function () {
    $(document).ready(function() {
        $("#rooms").click(function (e) {
            e.preventDefault();
            var href = $(this).attr('href');
            $('#main').load(href);
            $("#query").addClass("roomsQuery");
            $("#query").removeClass("coursesQuery");
            $("#query").removeClass("schedulingQuery");
            $("#query").removeClass("routesQuery");
            $("#map").hide();

            $(this).addClass("currentPage");
            $("#courses").removeClass("currentPage");
            $("#scheduling").removeClass("currentPage");
            $("#routes").removeClass("currentPage");

        });

        $("#courses").click(function (e) {
            e.preventDefault();
            var href = $(this).attr('href');
            $('#main').load(href, function () {
                greyOutSection();
            });
            $("#query").addClass("coursesQuery");
            $("#query").removeClass("roomsQuery");
            $("#query").remove("schedulingQuery");
            $("#query").removeClass("routesQuery");
            courseDepts = [];
            courseNumbers = [];
            courseInsts = [];
            courseTitles = [];
            $("#map").hide();


            $(this).addClass("currentPage");
            $("#rooms").removeClass("currentPage");
            $("#scheduling").removeClass("currentPage");
            $("#routes").removeClass("currentPage");

        });

        $("#routes").click(function (e) {
            e.preventDefault();
            $("#map").show();
            var href = $(this).attr('href');
            $('#main').load(href);
            $("#query").addClass("routesQuery");
            $("#query").removeClass("coursesQuery");
            $("#query").removeClass("schedulingQuery");
            $("#query").removeClass("roomsQuery");
            courses = [];
            initMap();
            $(this).addClass("currentPage");
            $("#courses").removeClass("currentPage");
            $("#scheduling").removeClass("currentPage");
            $("#rooms").removeClass("currentPage");
        });


        $("#query").submit(function (e) {
            e.preventDefault();
            if ($(this).hasClass("roomsQuery")) {
                submitRoomsQuery();
            }
            if ($(this).hasClass("coursesQuery")) {
                submitCoursesQuery();
            }

            if ($(this).hasClass("schedulingQuery")) {
                submitSchedulingQuery();
            }

            if ($(this).hasClass("routesQuery")) {
                submitRoutesQuery();
            }
        });

    });
});
