<script lang="ts">
    import type { PageData } from './$types';
    export let data: PageData;
</script>

<header>
    <h1>Information Sheet</h1>
</header>

<article>
    <h2>Introductory statement</h2>
    <dl>
        <dl>
            <dt>Researcher:</dt>
            <dd>Eddie Antonio Santos, PhD Candidate</dd>
            <dt>Affiliation:</dt>
            <dd>School of Computer Science</dd>
            <dt>Topics of study:</dt>
            <dd>
                Computing Education, Human-Computer Interaction, Programming Environments,
                Programming Assistants
            </dd>
            <dt>Topic of research:</dt>
            <dd>Resolving Errors with Different Computer Programming Assistants</dd>
        </dl>
    </dl>

    <section>
        <h2>What is the research about?</h2>
        <p>
            The research is about how novice programmers (for example, students) use error messages
            when fixing problems in their code. Historically, people have complained that the error
            messages you get when writing code are "frustrating", "terse", "misleading",
            "inadequate", "undecipherable", and "useless". Despite this, all programmers have to
            deal with error messages and fix buggy code, so it would be beneficial to understand
            what can help to improve error messages.
        </p>
    </section>

    <section>
        <h2>Why am I doing this research?</h2>
        <p>
            Recent advances in human-computer interaction and AI have produced new methods of
            improving error messages. Although there is theoretical evidence that these methods have
            the potential to improve error messages (at least, according to expert programmers), it
            is currently unknown whether these methods actually work in practice to help out
            students and newbies to fix errors in their code.
        </p>
    </section>

    <section>
        <h2>Why have you been invited to take part?</h2>
        <p>
            You are a student enrolled in an introductory computer science module. Since our
            research is about how error messages affect students, particularly ones who are new to
            programming, we require the time and opinions from students like you to provide genuine
            answers to our research questions.
        </p>
    </section>

    <section>
        <h2>How will your data be used?</h2>
        <p>
            During the study, you will provide data both via a questionnaire and through the use of
            a code editor (similar to VS Code) wherein you will do the programming exercises. We
            will use your responses from the questionnaires, as well as your interactions with the
            code editor to determine what style of error messages are the most effective. For most
            data collected, we will be looking at aggregates—that is, looking at sums and averages
            for the whole group of participants as a whole—rather than looking at particular
            individuals' responses. However, you will be asked some open-ended questions, and we
            might reproduce your responses anonymously.
        </p>
    </section>

    <section>
        <h2>What will happen if you decide to take part in this research study?</h2>
        <p>
            Once you read this information sheet, and accept to take part in data collection, you
            will be given a link to the code editor where you can begin the programming exercises.
            During this time, we will collect interaction data with the code editor (for example,
            when you click on something, your edits to the code). After you have completed the
            programming exercises, you will be redirected to a form to complete a questionnaire
            where you will be asked a few demographic questions, as well as some questions about
            your experience during the programming exercises.
        </p>
    </section>

    <section>
        <h2>How will your privacy be protected?</h2>
        <p>
            We will not be collecting any personal information or identifying information, such as
            your name, your email address, etc. Instead, we will use anonymous codes, which cannot
            be traced back to you. We will store and archive your data on an encrypted laptop
            provided by UCD. Your data will be archived for a period of five years after the study's
            completion, at which point, it will be permanently deleted.
        </p>
    </section>

    <section>
        <h2>What are the benefits of taking part in this research study?</h2>
        <p>
            There are no immediate benefits to you from participating in data collection. However,
            the insight that us researchers will gain from your participation will be used to
            directly improve error messages and code editors in the future. Consider it a good deed
            for future programmers — and quite possibly yourself! <strong>
                Your participation in data collection will not affect your module grade, either
                positively or negatively.
            </strong>
        </p>
    </section>

    <section>
        <h2>What are the risks of taking part in this research study?</h2>
        <p>
            There are no risks involved in this study. There is no assessment of your programming
            ability, and the data we collect from you during the study will not be traceable back to
            you. <strong>
                Your grade in this module will not be affected, either positively or negatively,
                whether you accept or decline to participate in data collection.
            </strong>
        </p>
    </section>

    <section>
        <h2>Can you change your mind at any stage and withdraw from the study?</h2>
        <p>
            Yes! You can withdraw consent from data collection at any point during the study, up
            until the moment you submit this form. If you withdraw consent midway through the study,
            we will immediately stop storing your data, and delete any data we have already
            collected from you. <strong>
                As soon as you submit this form, you will no longer be able to withdraw consent.
            </strong>
        </p>
    </section>

    <section>
        <h2>How will you find out what happens with this project?</h2>
        <p>
            You can email the head researcher, Eddie Antonio Santos, using the details below. I will
            be glad to provide you with any updates about the result of our study — however, do note
            that science can be a little slow, so it might take up to two years before we can share
            any results.
        </p>
    </section>
    <section>
        <h2>Contact details for further information:</h2>
        <p>
            If you have any questions about this study, feel free to contact me at
            <a href="mailto:eddie.santos+oq@ucdconnect.ie">eddie.santos@ucdconnect.ie</a> — I'll be happy
            to answer your questions!
        </p>
    </section>

    <div class="action-bar">
        <a href="/consent/{data.classroom}"><button>Continue</button></a>
    </div>
</article>

<style>
    .action-bar {
        display: flex;
        justify-content: flex-end;
    }
</style>
